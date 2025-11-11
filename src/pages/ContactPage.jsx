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
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Vérification de la configuration EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log("EmailJS Config Check:", {
      SERVICE_ID: serviceId ? "✓ Définie" : "✗ Manquante",
      TEMPLATE_ID: templateId ? "✓ Définie" : "✗ Manquante",
      PUBLIC_KEY: publicKey ? "✓ Définie" : "✗ Manquante",
    });

    if (serviceId && templateId && publicKey) {
      setIsConfigured(true);
      emailjs.init(publicKey);
    } else {
      setError(
        "Configuration EmailJS incomplète. Veuillez contacter l'administrateur."
      );
      console.error("Configuration EmailJS manquante");
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

    if (!isConfigured) {
      setError("Service d'email non configuré. Veuillez réessayer plus tard.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "fruitura@outlook.com",
        reply_to: formData.email,
      };

      console.log("Envoi en cours...", templateParams);

      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("✓ Email envoyé avec succès:", result.status, result.text);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("✗ Erreur EmailJS:", error);

      let errorMessage = "Erreur lors de l'envoi du message. ";

      if (error.status === 400) {
        errorMessage += "Paramètres invalides.";
      } else if (error.status === 403) {
        errorMessage += "Accès refusé. Vérifiez vos clés API.";
      } else if (error.status === 500) {
        errorMessage += "Erreur serveur. Veuillez réessayer.";
      } else {
        errorMessage += error.text || error.message || "Veuillez réessayer.";
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
              <p>
                Veuillez être le plus précis possible pour que nous puissions
                vous aider au mieux
              </p>
            </div>

            {!isConfigured && (
              <div className="error-message">
                <p>
                  Le service de contact est temporairement indisponible.
                  Veuillez nous contacter directement à fruitura@outlook.com
                </p>
              </div>
            )}

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
              isConfigured && (
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
              )
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
