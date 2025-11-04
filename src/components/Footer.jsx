import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Fruitura</h3>
            <p>
              Partagez vos fruits et légumes pour réduire le gaspillage
              alimentaire.
            </p>
          </div>

          <div className="footer-section">
            <h4>Liens utiles</h4>
            <ul>
              <li>
                <a href="/about">À propos</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/terms">Conditions d'utilisation</a>
              </li>
              <li>
                <a href="/privacy">Politique de confidentialité</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Communauté</h4>
            <ul>
              <li>
                <a href="/help">Aide</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Suivez-nous</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                📘
              </a>
              <a href="#" aria-label="Twitter">
                🐦
              </a>
              <a href="#" aria-label="Instagram">
                📷
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Fruitura. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
