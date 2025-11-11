// integrations/emailjs-service.js

// Configuration EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_otz2rwn",
  TEMPLATE_ID: "template_5x89iva",
  PUBLIC_KEY: "q8z75IXJXmV5DyNNG",
};

// Fonction pour charger EmailJS dynamiquement
const loadEmailJS = async () => {
  if (window.emailjs) {
    return window.emailjs;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      console.log("✅ EmailJS chargé avec succès");
      resolve(window.emailjs);
    };
    script.onerror = () => {
      console.error("❌ Erreur de chargement EmailJS");
      reject(new Error("Failed to load EmailJS"));
    };
    document.head.appendChild(script);
  });
};

// Initialisation
let emailjsInitialized = false;

const initializeEmailJS = async () => {
  try {
    const emailjs = await loadEmailJS();
    await emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    emailjsInitialized = true;
    console.log("✅ EmailJS initialisé avec la clé publique");
    return true;
  } catch (error) {
    console.error("❌ Erreur initialisation EmailJS:", error);
    return false;
  }
};

// Fonction d'envoi d'email
export const sendContactEmail = async (formData) => {
  try {
    console.log("📧 Début de l'envoi d'email...");

    // Initialiser EmailJS si pas déjà fait
    if (!emailjsInitialized) {
      const initialized = await initializeEmailJS();
      if (!initialized) {
        throw new Error("Impossible d'initialiser EmailJS");
      }
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: "fruitura@outlook.com",
      reply_to: formData.email,
    };

    console.log("📤 Envoi avec paramètres:", templateParams);

    const result = await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email envoyé avec succès!", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Erreur EmailJS:", error);

    let errorMessage = error.text || error.message || "Erreur inconnue";

    // Gestion spécifique des erreurs
    if (
      errorMessage.includes("public key") ||
      errorMessage.includes("The public key is required")
    ) {
      errorMessage =
        "Erreur de configuration: clé publique manquante ou invalide.";
    } else if (errorMessage.includes("template")) {
      errorMessage = "Erreur: template introuvable.";
    } else if (errorMessage.includes("service")) {
      errorMessage = "Erreur: service introuvable.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export default EMAILJS_CONFIG;
