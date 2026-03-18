const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    return res.status(500).json({
      message: "The server is missing GEMINI_API_KEY.",
    });
  }

  try {
    const payload =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});

    const upstreamResponse = await fetch(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      }
    );

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type") || "application/json";

    if (!upstreamResponse.ok) {
      let upstreamMessage = "";

      try {
        upstreamMessage = JSON.parse(responseText)?.error?.message || "";
      } catch {
        upstreamMessage = "";
      }

      if (
        upstreamResponse.status === 403 &&
        upstreamMessage.toLowerCase().includes("reported as leaked")
      ) {
        console.error("Gemini rejected the configured API key as leaked.");
        return res.status(503).json({
          message: "The AI interview service is temporarily unavailable. Please contact support.",
        });
      }
    }

    res.setHeader("Content-Type", contentType);
    return res.status(upstreamResponse.status).send(responseText);
  } catch (error) {
    console.error("Gemini proxy failed:", error);
    return res.status(502).json({
      message: "Unable to reach Gemini right now.",
    });
  }
}
