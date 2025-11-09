import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
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
        const { error } = await supabase
          .from("user_favorites_2025_10_29_18_05")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (!error) {
          setIsFavorite(false);
          onFavoriteToggle && onFavoriteToggle(listing.id, false);
        }
      } else {
        const { error } = await supabase
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

  const renderStars = (rating, showValue = false) => {
    if (!rating || rating === 0) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-badge">
        <div className="stars">
          {"★".repeat(fullStars)}
          {hasHalfStar && "⭐"}
          {"☆".repeat(emptyStars)}
        </div>
        {showValue && <span className="rating-value">{rating.toFixed(1)}</span>}
        {listing.rating_count > 0 && (
          <span className="rating-count">({listing.rating_count})</span>
        )}
      </div>
    );
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

          <div className="image-overlay">
            <div className="price-badge">
              {formatPrice(listing.price, listing.is_free)}
            </div>

            {listing.average_rating > 0 && (
              <div className="rating-overlay">
                {renderStars(listing.average_rating, true)}
              </div>
            )}

            {user && user.id !== listing.user_id && (
              <button
                className={`favorite-btn ${isFavorite ? "active" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={loading}
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            )}
          </div>
        </div>

        <div className="listing-content">
          <div className="listing-header">
            <h3 className="listing-title">{listing.title}</h3>
            {!listing.is_active && (
              <div className="status-badge inactive">⏸️ Inactive</div>
            )}
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
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
