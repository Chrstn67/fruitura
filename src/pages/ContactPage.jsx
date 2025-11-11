import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ContactPage.css";

// Importez la configuration depuis votre fichier emailjs.js
import { EMAILJS_CONFIG } from "../integrations/emailjs.js";

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

  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialiser EmailJS avec la clé publique
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
      console.log("Tentative d'envoi avec EmailJS...");
      console.log("Configuration:", EMAILJS_CONFIG);

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "fruitura@outlook.com",
        reply_to: formData.email,
      };

      console.log("Paramètres du template:", templateParams);

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("Email envoyé avec succès:", result);

      if (result.status === 200) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubmitted(true);
      } else {
        throw new Error(`Statut de réponse: ${result.status}`);
      }
    } catch (error) {
      console.error("Erreur détaillée EmailJS:", error);

      let errorMessage =
        "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.";

      if (error.text) {
        errorMessage += ` Détails: ${error.text}`;
      } else if (error.message) {
        errorMessage += ` Erreur: ${error.message}`;
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
                N'hésitez pas à nous contacter, nous vous répondrons dans les
                plus brefs délais.
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
