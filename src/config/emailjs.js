// integrations/emailjs-service.js
import emailjs from "@emailjs/browser";

// Configuration EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG",
};

// Initialisation au chargement du module
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendContactEmail = async (formData) => {
  try {
    console.log("📧 Envoi d'email avec EmailJS...");

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: "fruitura@outlook.com",
      reply_to: formData.email,
    };

    console.log("Paramètres:", templateParams);
    console.log("Configuration:", EMAILJS_CONFIG);

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email envoyé avec succès!");
    return { success: true, result };
  } catch (error) {
    console.error("❌ Erreur EmailJS:", error);
    return {
      success: false,
      error: error.text || error.message || "Erreur inconnue",
    };
  }
};

export default EMAILJS_CONFIG;
