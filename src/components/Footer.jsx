import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Scroll vers le haut quand la location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img
              src="/Logo-Fruitura.png"
              className="logo-icon"
              alt="Fruitura"
            />
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
                <Link to="/about">À propos</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/terms">Conditions d'utilisation</Link>
              </li>
              <li>
                <Link to="/privacy">Politique de confidentialité</Link>
              </li>
            </ul>
          </div>

          {/* <div className="footer-section">
            <h4>Communauté</h4>
            <ul>
              <li>
                <Link to="/help">Aide</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Fruitura. Tous droits réservés.</p>
          <img src="/Logo.jpg" className="logo-icon" alt="Logo" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
