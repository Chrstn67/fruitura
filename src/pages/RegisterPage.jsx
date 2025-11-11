import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (!formData.fullName.trim()) {
      setError("Le nom complet est requis");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Cette adresse email est déjà utilisée");
        } else {
          setError("Erreur lors de l'inscription : " + error.message);
        }
      } else {
        setMessage(
          "Inscription réussie ! Vérifiez votre email pour confirmer votre compte."
        );
        // Optionnel : rediriger après quelques secondes
        setTimeout(() => {
          window.location.href = "https://fruitura.vercel.app/#/login";
        }, 3000);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="register-container">
            <div className="register-header">
              <h1>Créer un compte</h1>
              <p>Rejoignez la communauté Fruitura et commencez à partager</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Nom complet *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
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
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Votre adresse (optionnel pour l'inscription)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Mot de passe *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Au moins 6 caractères"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Répétez votre mot de passe"
                  />
                </div>
              </div>

              <div className="form-terms">
                <p>
                  En créant un compte, vous acceptez nos{" "}
                  <Link to="/terms" className="link">
                    conditions d'utilisation
                  </Link>{" "}
                  et notre{" "}
                  <Link to="/privacy" className="link">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Création du compte..." : "Créer mon compte"}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Déjà un compte ?{" "}
                <Link to="/login" className="link">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
