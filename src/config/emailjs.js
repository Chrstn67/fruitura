// Configuration EmailJS
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG",
};

// Fonction de vérification améliorée
export const isEmailJSConfigured = () => {
  const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAILJS_CONFIG;
  return SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;
};

// Initialisation EmailJS
export const initEmailJS = () => {
  if (typeof window !== "undefined" && window.emailjs) {
    window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }
};
