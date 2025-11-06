import React, { useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/PrivacyPage.css";

const PrivacyPage = () => {
  // Scroll vers le haut au chargement de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-content">
            <h1>Politique de confidentialité</h1>

            <div className="content-section">
              <h2>1. Introduction</h2>
              <p>
                Chez Fruitura, nous respectons votre vie privée et nous nous
                engageons à protéger vos données personnelles. Cette politique
                explique comment nous collectons, utilisons et protégeons vos
                informations.
              </p>
            </div>

            <div className="content-section">
              <h2>2. Données collectées</h2>
              <h3>
                Informations que vous nous fournissez <i>consciemment</i> :
              </h3>
              <ul>
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Adresse (pour la localisation des annonces)</li>
                <li>Photos des fruits et légumes</li>
                <li>Messages échangés sur la plateforme</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>3. Utilisation des données</h2>
              <p>Nous utilisons vos données pour :</p>
              <ul>
                <li>Fournir et améliorer nos services</li>
                <li>Faciliter les échanges entre utilisateurs</li>
                <li>Vous envoyer des notifications</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>4. Partage des données</h2>
              <p>
                Nous ne vendons jamais vos données personnelles. Nous pouvons
                partager certaines informations uniquement dans les cas suivants
                :
              </p>
              <ul>
                <li>
                  Avec d'autres utilisateurs (nom, localisation générale) pour
                  faciliter les échanges
                </li>
                <li>
                  Avec nos prestataires techniques (hébergement, maintenance)
                </li>
                <li>Si requis par la loi ou les autorités compétentes</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>5. Sécurité des données</h2>
              <p>
                Nous mettons en place des mesures techniques et
                organisationnelles appropriées pour protéger vos données contre
                l'accès non autorisé, la perte ou la destruction.
              </p>
            </div>

            <div className="content-section">
              <h2>6. Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li>
                  <strong>Droit d'accès :</strong> consulter vos données
                  personnelles
                </li>
                <li>
                  <strong>Droit de rectification :</strong> corriger vos données
                </li>
                <li>
                  <strong>Droit à l'effacement :</strong> supprimer vos données
                </li>
                <li>
                  <strong>Droit à la portabilité :</strong> récupérer vos
                  données
                </li>
                <li>
                  <strong>Droit d'opposition :</strong> vous opposer au
                  traitement
                </li>
              </ul>
            </div>

            {/* <div className="content-section">
              <h2>7. Cookies</h2>
              <p>
                Nous utilisons des cookies techniques nécessaires au
                fonctionnement de la plateforme. Vous pouvez configurer votre
                navigateur pour refuser les cookies, mais cela peut affecter le
                fonctionnement du site.
              </p>
            </div> */}

            <div className="content-section">
              <h2>7. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que
                nécessaire pour fournir nos services ou respecter nos
                obligations légales. Les comptes inactifs depuis plus de 2 ans
                peuvent être supprimés.
              </p>
            </div>

            <div className="content-section">
              <h2>8. Contact</h2>
              <p>
                Pour exercer vos droits ou pour toute question concernant cette
                politique de confidentialité, contactez-nous contactez-nous
                via&nbsp;
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

export default PrivacyPage;
