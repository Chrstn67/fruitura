import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/App";
import "../styles/Header.css";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🍎</span>
            <span className="logo-text">Fruitura</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              Accueil
            </Link>
            {user ? (
              <>
                <Link to="/create-listing" className="nav-link">
                  Publier une annonce
                </Link>
                <Link to="/messages" className="nav-link">
                  Messages
                </Link>
                <Link to="/favorites" className="nav-link">
                  Favoris
                </Link>
                <Link to="/profile" className="nav-link">
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline btn-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Inscription
                </Link>
              </>
            )}
          </nav>

          <div className="mobile-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
