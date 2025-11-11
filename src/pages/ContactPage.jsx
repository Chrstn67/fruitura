import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ContactPage.css";

// Import de la configuration
import { EMAILJS_CONFIG, initEmailJS } from "../integrations/emailjs";

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

  // Scroll vers le haut et initialisation EmailJS
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialiser EmailJS
    initEmailJS();

    // Alternative: initialisation directe
    if (EMAILJS_CONFIG.PUBLIC_KEY) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
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
    setLoading(true);
    setError("");

    // Validation basique
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
      console.log("Tentative d'envoi avec la configuration:", EMAILJS_CONFIG);

      // Méthode recommandée pour EmailJS v4
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "fruitura@outlook.com",
        reply_to: formData.email,
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("Email envoyé avec succès:", result);

      if (result.status === 200) {
        // Réinitialiser le formulaire
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubmitted(true);
      } else {
        throw new Error(`Erreur ${result.status}: ${result.text}`);
      }
    } catch (error) {
      console.error("Erreur détaillée EmailJS:", error);

      // Messages d'erreur plus spécifiques
      if (error.text) {
        setError(`Erreur EmailJS: ${error.text}`);
      } else if (error.message) {
        setError(`Erreur: ${error.message}`);
      } else {
        setError(
          "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");
  };

  // // Test de la configuration
  // const testEmailJS = async () => {
  //   try {
  //     setLoading(true);
  //     const testParams = {
  //       from_name: "Test",
  //       from_email: "test@example.com",
  //       subject: "Test de configuration",
  //       message: "Ceci est un test de configuration EmailJS",
  //       to_email: "fruitura@outlook.com",
  //     };

  //     const result = await emailjs.send(
  //       EMAILJS_CONFIG.SERVICE_ID,
  //       EMAILJS_CONFIG.TEMPLATE_ID,
  //       testParams,
  //       EMAILJS_CONFIG.PUBLIC_KEY
  //     );

  //     console.log("Test réussi:", result);
  //     alert("Test de configuration réussi !");
  //   } catch (error) {
  //     console.error("Test échoué:", error);
  //     alert(`Test échoué: ${error.text || error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="contact-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-content">
            <h1>Nous contacter</h1>

            {/* Bouton de test (à retirer en production)
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={testEmailJS}
                className="btn btn-secondary"
                disabled={loading}
                style={{ marginBottom: "20px" }}
              >
                Tester la configuration EmailJS
              </button>
            )} */}

            <div className="contact-info">
              <p>
                Vous avez une question, une suggestion ou besoin d'aide ?
                N'hésitez pas à nous contacter, nous vous répondrons dans les
                plus brefs délais.
              </p>
              <p>
                Veuillez être le plus précis possible pour que nous puissions
                vous aider au mieux
              </p>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={resetForm} className="btn btn-secondary">
                  Réessayer
                </button>
              </div>
            )}

            {submitted ? (
              <div className="success-message">
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
                  disabled={loading}
                >
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            )}

            <div className="contact-details">
              <h2>Autres moyens de nous contacter</h2>
              <div className="contact-methods">
                <div className="contact-method">
                  <h3>Email</h3>
                  <p>fruitura@outlook.com</p>
                </div>
                <div className="contact-method">
                  <h3>Réponse</h3>
                  <p>
                    Nous nous engageons à répondre à tous les messages dans un
                    délai de 24 à 48 heures.
                  </p>
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
