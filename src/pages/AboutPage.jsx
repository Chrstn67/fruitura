import React, { useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/AboutPage.css";

const AboutPage = () => {
  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-content">
            <h1>À propos de Fruitura</h1>

            <div className="content-section">
              <h2>Notre mission</h2>
              <p>
                Fruitura est une plateforme communautaire dédiée à la réduction
                du gaspillage alimentaire. Notre mission est de connecter les
                personnes qui ont des fruits et légumes en surplus avec celles
                qui souhaitent les récupérer, créant ainsi une économie
                circulaire locale et solidaire.
              </p>
            </div>

            <div className="content-section">
              <h2>Comment ça marche ?</h2>
              <div className="steps">
                <div className="step">
                  <h3>1. Inscription</h3>
                  <p>Créez votre compte gratuitement sur notre plateforme.</p>
                </div>
                <div className="step">
                  <h3>2. Publication</h3>
                  <p>
                    Publiez une annonce avec vos fruits et légumes disponibles.
                  </p>
                </div>
                <div className="step">
                  <h3>3. Connexion</h3>
                  <p>
                    Les utilisateurs intéressés vous contactent directement.
                  </p>
                </div>
                <div className="step">
                  <h3>4. Partage</h3>
                  <p>Organisez la récupération et partagez vos récoltes !</p>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2>Nos valeurs</h2>
              <ul>
                <li>
                  <strong>Solidarité :</strong> Favoriser l'entraide entre
                  voisins
                </li>
                <li>
                  <strong>Écologie :</strong> Réduire le gaspillage alimentaire
                </li>
                <li>
                  <strong>Communauté :</strong> Créer du lien social local
                </li>
                <li>
                  <strong>Simplicité :</strong> Une plateforme facile à utiliser
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
