export type EmailJsConfig = {
  serviceId: string;
  screeningTemplateId: string;
  decisionTemplateId: string;
  publicKey: string;
};

function readEnv(value?: string): string {
  return (value || "").trim();
}

export function getEmailJsConfig(): EmailJsConfig {
  return {
    serviceId: readEnv(import.meta.env.VITE_EMAILJS_SERVICE_ID),
    screeningTemplateId: readEnv(import.meta.env.VITE_EMAILJS_SCREENING_TEMPLATE_ID),
    decisionTemplateId: readEnv(import.meta.env.VITE_EMAILJS_DECISION_TEMPLATE_ID),
    publicKey: readEnv(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
  };
}

export function getEmailJsConfigError(options?: {
  requireScreeningTemplate?: boolean;
  requireDecisionTemplate?: boolean;
  requireDecisionOrScreeningTemplate?: boolean;
}): string | null {
  const config = getEmailJsConfig();
  const missing: string[] = [];

  if (!config.serviceId) missing.push("VITE_EMAILJS_SERVICE_ID");
  if (!config.publicKey) missing.push("VITE_EMAILJS_PUBLIC_KEY");
  if (options?.requireScreeningTemplate && !config.screeningTemplateId) {
    missing.push("VITE_EMAILJS_SCREENING_TEMPLATE_ID");
  }
  if (options?.requireDecisionTemplate && !config.decisionTemplateId) {
    missing.push("VITE_EMAILJS_DECISION_TEMPLATE_ID");
  }
  if (
    options?.requireDecisionOrScreeningTemplate &&
    !config.decisionTemplateId &&
    !config.screeningTemplateId
  ) {
    missing.push("VITE_EMAILJS_DECISION_TEMPLATE_ID or VITE_EMAILJS_SCREENING_TEMPLATE_ID");
  }

  if (missing.length === 0) return null;

  return `Missing EmailJS configuration: ${missing.join(", ")}.`;
}
