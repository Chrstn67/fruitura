// Configuration EmailJS
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG",
};

// Fonction de vérification améliorée
export const isEmailJSConfigured = () => {
  const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAILJS_CONFIG;

  return (
    SERVICE_ID &&
    SERVICE_ID !== "" &&
    TEMPLATE_ID &&
    TEMPLATE_ID !== "" &&
    PUBLIC_KEY &&
    PUBLIC_KEY !== ""
  );
};

// Test de connexion EmailJS
export const testEmailJSConnection = async () => {
  try {
    const { emailjs } = await import("@emailjs/browser");
    await emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log("EmailJS initialisé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur d'initialisation EmailJS:", error);
    return false;
  }
};
