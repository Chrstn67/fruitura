// Configuration EmailJS - CORRIGÉ
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG", // Assurez-vous que cette clé est exacte
};

// Vérification de la configuration
export const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== "";
};

// Initialisation EmailJS
export const initEmailJS = async () => {
  const { default: emailjs } = await import("@emailjs/browser");
  if (EMAILJS_CONFIG.PUBLIC_KEY) {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    return true;
  }
  return false;
};
