import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import RatingSystem from "../components/RatingSystem.jsx";
import "../styles/ListingDetailPage.css";

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [contactMessage, setContactMessage] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [ownerAverageRating, setOwnerAverageRating] = useState(0);
  const [ownerTotalRatings, setOwnerTotalRatings] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (listing) {
      fetchRatings();
      fetchOwnerAverageRating();
    }
  }, [listing]);

  const fetchListing = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!user_id (
            full_name,
            avatar_url,
            phone
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error("Error fetching listing:", error);
      setError("Annonce non trouvée");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    if (!listing) return;

    try {
      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!receiver_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("giver_id", listing.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchOwnerAverageRating = async () => {
    if (!listing) return;

    try {
      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("rating")
        .eq("giver_id", listing.user_id);

      if (error) throw error;

      if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + item.rating, 0);
        const average = total / data.length;
        setOwnerAverageRating(average);
        setOwnerTotalRatings(data.length);
      } else {
        setOwnerAverageRating(0);
        setOwnerTotalRatings(0);
      }
    } catch (error) {
      console.error("Error fetching owner average rating:", error);
    }
  };

  const handleRatingSubmitted = () => {
    fetchRatings();
    fetchOwnerAverageRating();
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { error: reservationError } = await supabase
        .from("reservations_2025_10_29_18_05")
        .insert({
          listing_id: id,
          user_id: user.id,
          scheduled_date: reservationDate,
          message: contactMessage,
          status: "pending",
        });

      if (reservationError) throw reservationError;

      const { error: messageError } = await supabase
        .from("messages_2025_10_29_18_05")
        .insert({
          sender_id: user.id,
          receiver_id: listing.user_id,
          listing_id: id,
          content: `Nouvelle réservation pour "${listing.title}"\n\nDate souhaitée: ${reservationDate}\n\nMessage: ${contactMessage}`,
        });

      if (messageError) throw messageError;

      setShowContactForm(false);
      setContactMessage("");
      setReservationDate("");
      alert("Votre demande a été envoyée avec succès !");
    } catch (error) {
      console.error("Error sending contact:", error);
      alert("Erreur lors de l'envoi de votre demande");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return "Gratuit";
    return `${price}€`;
  };

  const renderStars = (rating, showValue = false, size = "medium") => {
    if (!rating || rating === 0) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="stars-display">
        <div className={`stars ${size}`}>
          {"★".repeat(fullStars)}
          {hasHalfStar && "⭐"}
          {"☆".repeat(emptyStars)}
        </div>
        {showValue && (
          <span className="rating-value">({rating.toFixed(1)})</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de l'annonce...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="error-page">
        <Header />
        <div className="container">
          <div className="error-content">
            <h1>Annonce non trouvée</h1>
            <p>Cette annonce n'existe pas ou a été supprimée.</p>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Retour à l'accueil
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="listing-detail-page">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="listing-detail">
            <div className="listing-gallery">
              {listing.photos && listing.photos.length > 0 ? (
                <>
                  <div className="main-photo">
                    <img
                      src={listing.photos[currentPhotoIndex]}
                      alt={listing.title}
                    />
                    {listing.photos.length > 1 && (
                      <>
                        <button
                          className="photo-nav prev"
                          onClick={() =>
                            setCurrentPhotoIndex(
                              currentPhotoIndex === 0
                                ? listing.photos.length - 1
                                : currentPhotoIndex - 1
                            )
                          }
                        >
                          ‹
                        </button>
                        <button
                          className="photo-nav next"
                          onClick={() =>
                            setCurrentPhotoIndex(
                              currentPhotoIndex === listing.photos.length - 1
                                ? 0
                                : currentPhotoIndex + 1
                            )
                          }
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  {listing.photos.length > 1 && (
                    <div className="photo-thumbnails">
                      {listing.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className={
                            index === currentPhotoIndex ? "active" : ""
                          }
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-photo">
                  <span>🍎</span>
                  <p>Aucune photo disponible</p>
                </div>
              )}
            </div>

            <div className="listing-info">
              <div className="listing-header">
                <h1>{listing.title}</h1>
                <div className="price-tag">
                  {formatPrice(listing.price, listing.is_free)}
                </div>
              </div>

              <div className="listing-meta">
                <div className="meta-item">
                  <span className="icon">🍓</span>
                  <span>{listing.fruit_type}</span>
                </div>
                <div className="meta-item">
                  <span className="icon">📍</span>
                  <span>{listing.address}</span>
                </div>
                <div className="meta-item">
                  <span className="icon">📅</span>
                  <span>Publié le {formatDate(listing.created_at)}</span>
                </div>
              </div>

              {listing.description && (
                <div className="listing-description">
                  <h3>Description</h3>
                  <p>{listing.description}</p>
                </div>
              )}

              <div className="listing-conditions">
                <h3>Conditions de cueillette</h3>
                <div className="conditions-list">
                  <div
                    className={`condition ${
                      listing.can_pick_from_tree ? "allowed" : "not-allowed"
                    }`}
                  >
                    <span className="icon">
                      {listing.can_pick_from_tree ? "✅" : "❌"}
                    </span>
                    <span>Cueillette sur l'arbre</span>
                  </div>
                  <div
                    className={`condition ${
                      listing.can_pick_from_ground ? "allowed" : "not-allowed"
                    }`}
                  >
                    <span className="icon">
                      {listing.can_pick_from_ground ? "✅" : "❌"}
                    </span>
                    <span>Ramassage au sol</span>
                  </div>
                  <div
                    className={`condition ${
                      listing.owner_presence_required
                        ? "required"
                        : "not-required"
                    }`}
                  >
                    <span className="icon">
                      {listing.owner_presence_required ? "👤" : "🔓"}
                    </span>
                    <span>
                      {listing.owner_presence_required
                        ? "Présence du propriétaire requise"
                        : "Accès libre"}
                    </span>
                  </div>
                </div>
              </div>

              {listing.available_times && (
                <div className="availability">
                  <h3>Disponibilité</h3>
                  <p>{listing.available_times}</p>
                </div>
              )}

              <div className="owner-info">
                <h3>Proposé par</h3>
                <div className="owner-card">
                  <div className="owner-avatar">
                    {listing.profiles_2025_10_29_18_05?.avatar_url ? (
                      <img
                        src={listing.profiles_2025_10_29_18_05.avatar_url}
                        alt="Avatar"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="owner-details">
                    <h4>
                      {listing.profiles_2025_10_29_18_05?.full_name ||
                        "Utilisateur"}
                    </h4>
                    {ownerTotalRatings > 0 && (
                      <div className="owner-rating">
                        {renderStars(ownerAverageRating, true, "small")}
                        <span className="rating-count">
                          {ownerTotalRatings}{" "}
                          {ownerTotalRatings > 1 ? "avis" : "avis"}
                        </span>
                      </div>
                    )}
                    {ownerTotalRatings === 0 && (
                      <div className="no-ratings">
                        <span>Aucun avis pour le moment</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Système d'évaluation */}
              {user && user.id !== listing.user_id && (
                <div className="rating-section">
                  <RatingSystem
                    listingId={listing.id}
                    giverId={listing.user_id}
                    onRatingSubmitted={handleRatingSubmitted}
                  />
                </div>
              )}

              {user && user.id !== listing.user_id && (
                <div className="action-buttons">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    Contacter le propriétaire
                  </button>
                </div>
              )}
            </div>
          </div>

          {ratings.length > 0 && (
            <div className="ratings-section">
              <div className="ratings-header">
                <h2>Avis des utilisateurs ({ratings.length})</h2>
              </div>
              <div className="ratings-list">
                {ratings.map((rating) => (
                  <div key={rating.id} className="rating-item">
                    <div className="rating-header">
                      <div className="rating-user">
                        <div className="user-avatar">
                          {rating.profiles_2025_10_29_18_05?.avatar_url ? (
                            <img
                              src={rating.profiles_2025_10_29_18_05.avatar_url}
                              alt="Avatar"
                            />
                          ) : (
                            <span>👤</span>
                          )}
                        </div>
                        <div className="user-info">
                          <h4>
                            {rating.profiles_2025_10_29_18_05?.full_name ||
                              "Utilisateur"}
                          </h4>
                          <div className="rating-stars">
                            {renderStars(rating.rating, false, "small")}
                            <span className="individual-rating">
                              ({rating.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="rating-date">
                        {formatDate(rating.created_at)}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="rating-comment">"{rating.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de contact */}
        {showContactForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowContactForm(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Contacter le propriétaire</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowContactForm(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Date souhaitée</label>
                  <input
                    type="datetime-local"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows="4"
                    placeholder="Votre message..."
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowContactForm(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetailPage;
