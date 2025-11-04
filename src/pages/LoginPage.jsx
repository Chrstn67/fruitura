import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        setError("Email ou mot de passe incorrect");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Veuillez saisir votre email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await resetPassword(formData.email);

      if (error) {
        setError("Erreur lors de l'envoi de l'email de réinitialisation");
      } else {
        setMessage("Un email de réinitialisation a été envoyé à votre adresse");
        setShowResetForm(false);
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="login-container">
            <div className="login-header">
              <h1>Connexion</h1>
              <p>Connectez-vous pour accéder à votre compte Fruitura</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {message && <div className="alert alert-success">{message}</div>}

            {!showResetForm ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
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
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Votre mot de passe"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>

                <div className="form-links">
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setShowResetForm(true)}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="reset-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
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

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Envoi..." : "Réinitialiser le mot de passe"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowResetForm(false)}
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            )}

            <div className="login-footer">
              <p>
                Pas encore de compte ?{" "}
                <Link to="/register" className="link">
                  Créer un compte
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

export default LoginPage;
