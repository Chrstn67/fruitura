import React, { useState } from "react";
import { Link } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Rating from "../components/Rating.jsx";
import "../styles/ListingCard.css";

const ListingCard = ({ listing, onFavoriteToggle }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    setLoading(true);
    try {
      if (isFavorite) {
        const { error } = await superbase
          .from("user_favorites_2025_10_29_18_05")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (!error) {
          setIsFavorite(false);
          onFavoriteToggle && onFavoriteToggle(listing.id, false);
        }
      } else {
        const { error } = await superbase
          .from("user_favorites_2025_10_29_18_05")
          .insert({
            user_id: user.id,
            listing_id: listing.id,
          });

        if (!error) {
          setIsFavorite(true);
          onFavoriteToggle && onFavoriteToggle(listing.id, true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return "Gratuit";
    return `${price}€`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="listing-card">
      <Link to={`/listing/${listing.id}`} className="listing-link">
        <div className="listing-image">
          {listing.photos && listing.photos.length > 0 ? (
            <img src={listing.photos[0]} alt={listing.title} />
          ) : (
            <div className="no-image">
              <span>🍎</span>
            </div>
          )}

          {user && (
            <button
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={handleFavoriteToggle}
              disabled={loading}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          )}
        </div>

        <div className="listing-content">
          <div className="listing-header">
            <h3 className="listing-title">{listing.title}</h3>
            <div className="listing-price">
              {formatPrice(listing.price, listing.is_free)}
            </div>
          </div>

          <div className="listing-details">
            <div className="fruit-type">
              <span className="icon">🍓</span>
              {listing.fruit_type}
            </div>

            <div className="location">
              <span className="icon">📍</span>
              {listing.address}
            </div>

            <div className="date">
              <span className="icon">📅</span>
              Publié le {formatDate(listing.created_at)}
            </div>
          </div>

          {listing.description && (
            <p className="listing-description">
              {listing.description.length > 100
                ? `${listing.description.substring(0, 100)}...`
                : listing.description}
            </p>
          )}

          <div className="listing-features">
            {listing.can_pick_from_tree && (
              <span className="feature">🌳 Cueillette sur arbre</span>
            )}
            {listing.can_pick_from_ground && (
              <span className="feature">🍂 Ramassage au sol</span>
            )}
            {listing.owner_presence_required && (
              <span className="feature">👤 Présence requise</span>
            )}
          </div>

          {listing.average_rating && (
            <div className="listing-rating">
              <Rating value={listing.average_rating} readonly />
              <span className="rating-count">
                ({listing.rating_count} avis)
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
