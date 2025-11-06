import React, { useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/TermsPage.css";

const TermsPage = () => {
  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-content">
            <h1>Conditions d'utilisation</h1>

            <div className="last-updated">
              <p>
                <em>Dernière mise à jour : 06 novembre 2025</em>
              </p>
            </div>

            <div className="content-section">
              <h2>1. Acceptation des conditions</h2>
              <p>
                En utilisant la plateforme Fruitura, vous acceptez d'être lié
                par ces conditions d'utilisation. Si vous n'acceptez pas ces
                conditions, veuillez ne pas utiliser notre service.
              </p>
            </div>

            <div className="content-section">
              <h2>2. Description du service</h2>
              <p>
                Fruitura est une plateforme qui permet aux utilisateurs de
                partager leurs fruits et légumes excédentaires avec d'autres
                membres de la communauté. Notre objectif est de réduire le
                gaspillage alimentaire et de favoriser les échanges locaux.
              </p>
            </div>

            <div className="content-section">
              <h2>3. Inscription et compte utilisateur</h2>
              <ul>
                <li>
                  Vous devez fournir des informations exactes lors de votre
                  inscription
                </li>
                <li>Vous êtes responsable de la sécurité de votre compte</li>
                <li>Un seul compte par personne est autorisé</li>
                <li>
                  Vous devez avoir au moins 18 ans pour utiliser le service
                </li>
              </ul>
            </div>

            <div className="content-section">
              <h2>4. Utilisation de la plateforme</h2>
              <h3>Vous vous engagez à :</h3>
              <ul>
                <li>Publier des annonces véridiques et à jour</li>
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales</li>
                <li>Respecter les lois en vigueur</li>
              </ul>

              <h3>Il est interdit de :</h3>
              <ul>
                <li>Publier du contenu offensant ou inapproprié</li>
                <li>Harceler ou intimider d'autres utilisateurs</li>
                <li>Utiliser la plateforme pour des activités illégales</li>
                <li>Tenter de contourner les mesures de sécurité</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>5. Responsabilité</h2>
              <p>
                Fruitura agit comme un intermédiaire entre les utilisateurs.
                Nous ne sommes pas responsables de la qualité, de la sécurité ou
                de la légalité des produits partagés. Les échanges se font sous
                la responsabilité des utilisateurs.
              </p>
            </div>

            <div className="content-section">
              <h2>6. Modération</h2>
              <p>
                Nous nous réservons le droit de modérer le contenu publié sur la
                plateforme et de suspendre ou supprimer les comptes qui ne
                respectent pas ces conditions d'utilisation.
              </p>
            </div>

            <div className="content-section">
              <h2>7. Modifications des conditions</h2>
              <p>
                Nous pouvons modifier ces conditions d'utilisation à tout
                moment. Les utilisateurs seront informés des changements
                importants par email ou via la plateforme.
              </p>
            </div>

            <div className="content-section">
              <h2>8. Contact</h2>
              <p>
                Pour toute question concernant les présentes conditions
                d'utilisation, contactez-nous via&nbsp;
                <strong>
                  <a
                    href="https://fruitura.vercel.app/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    le formulaire de contact
                  </a>
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
