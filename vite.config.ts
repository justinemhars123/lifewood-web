import path from 'path';
import geminiHandler from './api/gemini';
import interviewApplicantHandler from './api/interview-applicant';
import interviewCompleteHandler from './api/interview-complete';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function readJsonBody(req: any) {
  return new Promise<void>((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.body !== undefined) {
      resolve();
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks).toString('utf8').trim();
      if (!rawBody) {
        req.body = undefined;
        resolve();
        return;
      }

      try {
        req.body = JSON.parse(rawBody);
      } catch {
        req.body = rawBody;
      }

      resolve();
    });
    req.on('error', reject);
  });
}

function enhanceResponse(res: any) {
  if (typeof res.status === 'function') return res;

  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload: unknown) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  res.send = (payload: unknown) => {
    if (typeof payload === 'string' || Buffer.isBuffer(payload)) {
      res.end(payload);
      return res;
    }

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  return res;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  for (const [key, value] of Object.entries(env)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'local-api-routes',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const requestUrl = req.url ? new URL(req.url, 'http://localhost') : null;
            const pathname = requestUrl?.pathname;

            const routeHandlers: Record<string, (req: any, res: any) => Promise<any>> = {
              '/api/gemini': geminiHandler,
              '/api/interview-applicant': interviewApplicantHandler,
              '/api/interview-complete': interviewCompleteHandler,
            };

            const handler = pathname ? routeHandlers[pathname] : undefined;

            if (!handler) {
              next();
              return;
            }

            try {
              (req as any).query = requestUrl
                ? Object.fromEntries(requestUrl.searchParams.entries())
                : {};
              await readJsonBody(req);
              await handler(req, enhanceResponse(res));

              if (!res.writableEnded) {
                next();
              }
            } catch (error) {
              console.error(`Local API route failed for ${pathname}:`, error);
              if (!res.headersSent) {
                enhanceResponse(res).status(500).json({
                  message: 'Local API route failed.',
                });
                return;
              }
              next(error as Error);
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
