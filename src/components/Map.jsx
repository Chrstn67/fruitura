// components/Map.jsx - Version Leaflet vanilla
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Map = ({ listings = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser la carte
    mapInstance.current = L.map(mapRef.current).setView(
      [46.603354, 1.888334],
      6
    );

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Marquer comme chargé
    mapInstance.current.whenReady(() => {
      setIsLoaded(true);
    });

    // Nettoyage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !isLoaded) return;

    // Supprimer tous les marqueurs existants
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Ajouter les nouveaux marqueurs
    listings.forEach((listing) => {
      if (listing.latitude && listing.longitude) {
        const marker = L.marker([listing.latitude, listing.longitude])
          .bindPopup(`
            <div class="map-popup">
              <h3>${listing.title}</h3>
              <p><strong>Type:</strong> ${listing.fruit_type}</p>
              <p><strong>Prix:</strong> ${
                listing.is_free ? "🆓 Gratuit" : `💰 ${listing.price}€`
              }</p>
              
              <div class="popup-actions">
                <button class="popup-link" data-listing-id="${
                  listing.id
                }">Voir l'annonce</button>
              </div>
            </div>
          `);

        marker.addTo(mapInstance.current);

        // Ajouter un événement de clic pour gérer la navigation
        marker.on("popupopen", () => {
          // Attendre que le popup soit complètement rendu
          setTimeout(() => {
            const link = document.querySelector(
              `[data-listing-id="${listing.id}"]`
            );
            if (link) {
              link.addEventListener("click", (e) => {
                e.preventDefault();
                navigate(`/listing/${listing.id}`);
              });
            }
          }, 100);
        });
      }
    });

    // Ajuster la vue si nécessaire
    if (listings.length > 0) {
      const validListings = listings.filter((l) => l.latitude && l.longitude);
      if (validListings.length > 0) {
        const group = new L.featureGroup(
          validListings.map((l) => L.marker([l.latitude, l.longitude]))
        );
        mapInstance.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [listings, isLoaded, navigate]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map-element" />
      {!isLoaded && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Chargement de la carte...</p>
        </div>
      )}
    </div>
  );
};

export default Map;
