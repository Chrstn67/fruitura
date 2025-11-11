// Configuration EmailJS
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG",
};

// Vérification de la configuration
export const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.SERVICE_ID !== "service_otz2rwn" &&
    EMAILJS_CONFIG.TEMPLATE_ID !== "template_5x89iva" &&
    EMAILJS_CONFIG.PUBLIC_KEY !== "q8z75IXJXmV5DyNNG"
  );
};
