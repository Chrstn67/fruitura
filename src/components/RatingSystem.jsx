import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "./App.jsx";
import "../styles/RatingSystem.css";

const RatingSystem = ({ listingId, giverId, onRatingSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRatings, setUserRatings] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (user && listingId && giverId) {
      loadAllData();
    }
  }, [user, listingId, giverId]);

  const loadAllData = async () => {
    await Promise.all([
      checkExistingRating(),
      fetchAverageRating(),
      fetchUserRatings(),
    ]);
  };

  const checkExistingRating = async () => {
    if (!user) return;

    try {
      console.log("🔍 Checking existing rating for user:", user.id);

      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("*")
        .eq("listing_id", listingId)
        .eq("giver_id", giverId)
        .eq("receiver_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking existing rating:", error);
        return;
      }

      console.log("📊 Existing rating data:", data);
      if (data) {
        setExistingRating(data);
        setRating(data.rating);
        setComment(data.comment || "");
      } else {
        setExistingRating(null);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      console.error("❌ Error in checkExistingRating:", error);
    }
  };

  const fetchAverageRating = async () => {
    try {
      console.log("📈 Fetching average rating for giver:", giverId);

      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("rating")
        .eq("giver_id", giverId);

      if (error) {
        console.error("Error fetching average rating:", error);
        return;
      }

      console.log("📊 All ratings data:", data);
      if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + item.rating, 0);
        const average = total / data.length;
        setAverageRating(average);
        setTotalRatings(data.length);
        console.log(
          "✅ Average calculated:",
          average,
          "Total ratings:",
          data.length
        );
      } else {
        setAverageRating(0);
        setTotalRatings(0);
        console.log("📭 No ratings found");
      }
    } catch (error) {
      console.error("❌ Error fetching average rating:", error);
    }
  };

  const fetchUserRatings = async () => {
    try {
      console.log("👥 Fetching user ratings for giver:", giverId);

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
        .eq("giver_id", giverId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user ratings:", error);
        return;
      }

      console.log("📝 User ratings found:", data);
      setUserRatings(data || []);
    } catch (error) {
      console.error("❌ Error fetching user ratings:", error);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting rating...");

    if (!rating || rating < 1 || rating > 5) {
      alert("Veuillez sélectionner une note entre 1 et 5 étoiles");
      return;
    }

    if (!user) {
      alert("Vous devez être connecté pour laisser un avis");
      return;
    }

    if (!listingId || !giverId) {
      alert("Informations manquantes pour soumettre l'avis");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (existingRating) {
        console.log("🔄 Updating existing rating:", existingRating.id);
        // Mise à jour - SEULEMENT les champs modifiables
        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .update({
            rating: rating,
            comment: comment.trim(),
          })
          .eq("id", existingRating.id)
          .select();

        if (result.error) {
          console.error("❌ Update error:", result.error);
          throw result.error;
        }
        console.log("✅ Update result:", result.data);
      } else {
        console.log("🆕 Creating new rating");
        // Nouvelle évaluation - laisser la DB gérer les timestamps
        const ratingData = {
          listing_id: listingId,
          giver_id: giverId,
          receiver_id: user.id,
          rating: rating,
          comment: comment.trim(),
        };

        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .insert(ratingData)
          .select();

        if (result.error) {
          console.error("❌ Insert error:", result.error);
          throw result.error;
        }
        console.log("✅ Insert result:", result.data);
      }

      alert(
        existingRating
          ? "Évaluation mise à jour avec succès !"
          : "Évaluation soumise avec succès !"
      );

      setShowForm(false);
      // Rafraîchir toutes les données
      await loadAllData();

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      alert("Erreur lors de la soumission de l'évaluation: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (
      !existingRating ||
      !window.confirm("Êtes-vous sûr de vouloir supprimer votre évaluation ?")
    ) {
      return;
    }

    setSubmitting(true);
    try {
      console.log("🗑️ Deleting rating:", existingRating.id);

      const { error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .delete()
        .eq("id", existingRating.id);

      if (error) {
        console.error("❌ Delete error:", error);
        throw error;
      }

      alert("Évaluation supprimée avec succès !");

      // Réinitialiser l'état local
      setExistingRating(null);
      setRating(0);
      setComment("");
      setShowForm(false);

      // Rafraîchir les données depuis la base
      await loadAllData();

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("❌ Error deleting rating:", error);
      alert("Erreur lors de la suppression de l'évaluation: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, interactive = false, size = "medium") => {
    const displayRating = interactive && hoverRating > 0 ? hoverRating : value;
    const starSize = {
      small: "1rem",
      medium: "1.25rem",
      large: "1.5rem",
    }[size];

    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${star <= displayRating ? "filled" : ""} ${
          interactive ? "interactive" : ""
        } ${size}`}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        disabled={!interactive || submitting}
        style={{ fontSize: starSize }}
      >
        ⭐
      </button>
    ));
  };

  const renderAverageStars = (value, size = "small") => {
    const starSize = {
      small: "1rem",
      medium: "1.1rem",
      large: "1.25rem",
    }[size];

    return (
      <div className="average-stars">
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= value ? "filled" : ""} ${size}`}
              style={{ fontSize: starSize }}
            >
              ⭐
            </span>
          ))}
        </div>
        <span className="average-text">
          {value.toFixed(1)} ({totalRatings}{" "}
          {totalRatings === 1 ? "avis" : "avis"})
        </span>
      </div>
    );
  };

  // Afficher tous les avis sauf celui de l'utilisateur courant
  const publicRatings = userRatings.filter(
    (rating) => rating.receiver_id !== user?.id
  );

  if (!user || user.id === giverId) {
    return null;
  }

  return (
    <div className="rating-system">
      {/* Note moyenne */}
      <div className="average-rating-section">
        <h4>Note moyenne du propriétaire</h4>
        {totalRatings > 0 ? (
          renderAverageStars(averageRating, "medium")
        ) : (
          <div className="no-ratings-text">
            <span className="no-ratings">Aucune évaluation pour le moment</span>
          </div>
        )}
      </div>

      {/* Section des avis utilisateurs */}
      {publicRatings.length > 0 && (
        <div className="user-ratings-section">
          <h4>Avis des utilisateurs ({publicRatings.length})</h4>
          <div className="ratings-list">
            {publicRatings.map((userRating) => (
              <div key={userRating.id} className="rating-item">
                <div className="rating-meta">
                  <div className="user-info">
                    <div className="user-avatar">
                      {userRating.profiles_2025_10_29_18_05?.avatar_url ? (
                        <img
                          src={userRating.profiles_2025_10_29_18_05.avatar_url}
                          alt="Avatar"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="user-details">
                      <h5>
                        {userRating.profiles_2025_10_29_18_05?.full_name ||
                          "Utilisateur"}
                      </h5>
                      <div className="user-stars">
                        {renderStars(userRating.rating, false, "small")}
                        <span className="rating-value">
                          ({userRating.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="rating-date">
                    {new Date(userRating.created_at).toLocaleDateString(
                      "fr-FR"
                    )}
                  </span>
                </div>
                {userRating.comment && (
                  <p className="rating-comment">"{userRating.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section évaluation personnelle */}
      <div className="personal-rating-section">
        {existingRating ? (
          <div className="existing-rating">
            <div className="rating-header">
              <h4>Votre évaluation</h4>
              <div className="rating-actions">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setShowForm(!showForm)}
                  disabled={submitting}
                >
                  {showForm ? "Annuler" : "Modifier"}
                </button>
                <button
                  className="btn btn-xs btn-danger"
                  onClick={handleDeleteRating}
                  disabled={submitting}
                >
                  Supprimer
                </button>
              </div>
            </div>
            {!showForm && (
              <div className="rating-display">
                <div className="stars-display">
                  {renderStars(existingRating.rating, false, "small")}
                  <span className="user-rating-value">
                    ({existingRating.rating}/5)
                  </span>
                </div>
                {existingRating.comment && (
                  <p className="rating-comment">"{existingRating.comment}"</p>
                )}
                <div className="rating-date">
                  Dernière modification :{" "}
                  {new Date(
                    existingRating.updated_at || existingRating.created_at
                  ).toLocaleDateString("fr-FR")}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-rating">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(true)}
              disabled={submitting}
            >
              ⭐ Évaluer ce propriétaire
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmitRating} className="rating-form">
            <div className="form-group">
              <label>Note (obligatoire)</label>
              <div className="stars-input">
                {renderStars(rating, true, "medium")}
                <div className="rating-value-display">
                  {rating > 0 && `(${rating}/5 étoiles)`}
                </div>
              </div>
              <small>Cliquez sur les étoiles pour noter de 1 à 5</small>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Commentaire (optionnel)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce propriétaire..."
                rows="3"
                maxLength="500"
                disabled={submitting}
              />
              <small>{comment.length}/500 caractères</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setShowForm(false);
                  // Réinitialiser aux valeurs originales
                  if (existingRating) {
                    setRating(existingRating.rating);
                    setComment(existingRating.comment || "");
                  } else {
                    setRating(0);
                    setComment("");
                  }
                }}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !rating}
              >
                {submitting
                  ? "Envoi..."
                  : existingRating
                  ? "Mettre à jour"
                  : "Soumettre"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;
