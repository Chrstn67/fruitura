import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { sendContactEmail } from "../integrations/emailjs-service.js";
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

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Début de l'envoi du formulaire...");

      const result = await sendContactEmail(formData);

      if (result.success) {
        console.log("✅ Formulaire envoyé avec succès!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubmitted(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Erreur finale:", error);

      let errorMessage =
        "Une erreur s'est produite lors de l'envoi du message. ";

      if (
        error.message.includes("public key") ||
        error.message.includes("The public key is required")
      ) {
        errorMessage =
          "Erreur de configuration EmailJS. La clé publique est manquante ou invalide.";
      } else if (
        error.message.includes("template") ||
        error.message.includes("Template not found")
      ) {
        errorMessage =
          "Erreur de template EmailJS. Le modèle d'email est introuvable.";
      } else if (
        error.message.includes("service") ||
        error.message.includes("Service not found")
      ) {
        errorMessage =
          "Erreur de service EmailJS. Le service email est introuvable.";
      } else {
        errorMessage += `Détails: ${error.message}`;
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
                <h3>Erreur</h3>
                <p>{error}</p>
                <button onClick={resetForm} className="btn btn-secondary">
                  Réessayer
                </button>
              </div>
            )}

            {submitted ? (
              <div className="alert alert-success">
                <h2>✅ Message envoyé !</h2>
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
                    placeholder="Votre nom complet"
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
                    placeholder="votre@email.com"
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
                    placeholder="Sujet de votre message"
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
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "⏳ Envoi en cours..." : "📤 Envoyer le message"}
                </button>
              </form>
            )}

            <div className="contact-details">
              <h2>Autres moyens de contact</h2>
              <div className="contact-methods">
                <div className="contact-method">
                  <h3>Email direct</h3>
                  <p>fruitura@outlook.com</p>
                </div>
                <div className="contact-method">
                  <h3>Support</h3>
                  <p>Nous répondons sous 24-48 heures</p>
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
