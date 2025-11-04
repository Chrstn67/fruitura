import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Rating from "../components/Rating.jsx";
import "../styles/ListingDetailPage.css";

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [contactMessage, setContactMessage] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    fetchListing();
    fetchRatings();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);

      const { data, error } = await superbase
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
    try {
      const { data, error } = await superbase
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
        .eq("listing_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Créer une réservation
      const { error: reservationError } = await superbase
        .from("reservations_2025_10_29_18_05")
        .insert({
          listing_id: id,
          user_id: user.id,
          scheduled_date: reservationDate,
          message: contactMessage,
        });

      if (reservationError) throw reservationError;

      // Envoyer un message privé
      const { error: messageError } = await superbase
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

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newRating) return;

    try {
      const { error } = await superbase
        .from("ratings_2025_10_29_18_05")
        .insert({
          listing_id: id,
          giver_id: listing.user_id,
          receiver_id: user.id,
          rating: newRating,
          comment: ratingComment,
        });

      if (error) throw error;

      setShowRatingForm(false);
      setNewRating(0);
      setRatingComment("");
      fetchRatings();
      alert("Votre évaluation a été ajoutée !");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Erreur lors de l'ajout de votre évaluation");
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

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

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
                    {averageRating > 0 && (
                      <div className="owner-rating">
                        <Rating value={averageRating} readonly size="small" />
                        <span>({ratings.length} avis)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user && user.id !== listing.user_id && (
                <div className="action-buttons">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    Contacter le propriétaire
                  </button>
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => setShowRatingForm(true)}
                  >
                    Laisser un avis
                  </button>
                </div>
              )}
            </div>
          </div>

          {ratings.length > 0 && (
            <div className="ratings-section">
              <h2>Avis ({ratings.length})</h2>
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
                            <Rating
                              value={rating.rating}
                              readonly
                              size="small"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rating-date">
                        {formatDate(rating.created_at)}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="rating-comment">{rating.comment}</p>
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

        {/* Modal d'évaluation */}
        {showRatingForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowRatingForm(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Laisser un avis</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowRatingForm(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleRatingSubmit}>
                <div className="form-group">
                  <label>Note</label>
                  <div className="rating-input">
                    <Rating
                      value={newRating}
                      onChange={setNewRating}
                      size="large"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Commentaire (optionnel)</label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows="4"
                    placeholder="Partagez votre expérience..."
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowRatingForm(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newRating}
                  >
                    Publier l'avis
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
