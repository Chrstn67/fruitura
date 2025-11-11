import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ContactPage.css";

// Remplacez ces valeurs par vos identifiants EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

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

  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialiser EmailJS (optionnel mais recommandé)
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer les erreurs quand l'utilisateur modifie le formulaire
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Envoyer l'email via EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: "fruitura@outlook.com",
          from_name: formData.name,
          reply_to: formData.email,
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("Email envoyé avec succès:", result);

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      setError(
        "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer."
      );
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
                  <label htmlFor="email">Mon email *</label>
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
