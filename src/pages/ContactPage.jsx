import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ContactPage.css";

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

    // Debug : vérifier si les variables d'environnement sont chargées
    console.log("EmailJS Config:", {
      SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        ? "✓ Définie"
        : "✗ Manquante",
    });

    // Initialiser EmailJS avec la clé publique
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    } else {
      console.error("PUBLIC_KEY manquante dans les variables d'environnement");
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

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Vérification avant envoi
    if (!serviceId || !templateId || !publicKey) {
      setError(
        "Configuration EmailJS incomplète. Veuillez vérifier vos variables d'environnement."
      );
      setLoading(false);
      return;
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "fruitura@outlook.com",
        reply_to: formData.email,
      };

      console.log("Envoi avec params:", templateParams);

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log("✓ Email envoyé avec succès:", result);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("✗ Erreur lors de l'envoi:", error);
      setError(
        `Erreur: ${
          error.text ||
          error.message ||
          "Impossible d'envoyer le message. Veuillez réessayer."
        }`
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
