// emailjs.js - CORRIGÉ
export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.SERVICE_ID &&
    EMAILJS_CONFIG.TEMPLATE_ID &&
    EMAILJS_CONFIG.PUBLIC_KEY
  );
};
