import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ContactPage.css";

// Importez la configuration
import { EMAILJS_CONFIG, initEmailJS } from "../integrations/emailjs.js";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailjsReady, setEmailjsReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialiser EmailJS au chargement du composant
    const initialize = async () => {
      try {
        await initEmailJS();
        setEmailjsReady(true);
        console.log("EmailJS initialisé avec succès");
      } catch (error) {
        console.error("Erreur d'initialisation EmailJS:", error);
        setError("Erreur de configuration EmailJS");
      }
    };

    initialize();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailjsReady) {
      setError("EmailJS n'est pas encore initialisé. Veuillez patienter.");
      return;
    }

    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    try {
      console.log("Envoi avec EmailJS...", EMAILJS_CONFIG);

      // Méthode 1 : Utilisation directe avec la clé publique en paramètre
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: "fruitura@outlook.com",
          reply_to: formData.email,
        },
        EMAILJS_CONFIG.PUBLIC_KEY // Fournir explicitement la clé publique
      );

      console.log("✅ Email envoyé avec succès:", result);

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Erreur EmailJS détaillée:", error);

      let errorMessage = "Erreur lors de l'envoi du message. ";

      if (error.text) {
        errorMessage += `Détails: ${error.text}`;
      } else if (error.message) {
        errorMessage += `Message: ${error.message}`;
      } else if (error.status) {
        errorMessage += `Statut: ${error.status}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="contact-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-content">
            <h1>Nous contacter</h1>

            <div className="contact-info">
              <p>
                Vous avez une question, une suggestion ou besoin d'aide ?
                N'hésitez pas à nous contacter.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <p>{error}</p>
                <button onClick={resetForm} className="btn btn-secondary">
                  Réessayer
                </button>
              </div>
            )}

            {submitted ? (
              <div className="alert alert-success">
                <h2>Message envoyé !</h2>
                <p>
                  Merci pour votre message. Nous vous répondrons rapidement.
                </p>
                <button onClick={resetForm} className="btn btn-primary">
                  Envoyer un nouveau message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Nom *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Sujet *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !emailjsReady}
                >
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </button>

                {!emailjsReady && (
                  <p className="text-warning">Initialisation en cours...</p>
                )}
              </form>
            )}

            <div className="contact-details">
              <h2>Autres moyens de contact</h2>
              <div className="contact-methods">
                <div className="contact-method">
                  <h3>Email direct</h3>
                  <p>fruitura@outlook.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
