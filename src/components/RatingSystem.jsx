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

  useEffect(() => {
    if (user && listingId && giverId) {
      checkExistingRating();
      fetchAverageRating();
    }
  }, [user, listingId, giverId]);

  const checkExistingRating = async () => {
    if (!user) return;

    try {
      console.log("🔍 Checking existing rating for:", {
        listingId,
        giverId,
        userId: user.id,
      });

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

      if (data) {
        console.log("✅ Found existing rating:", data);
        setExistingRating(data);
        setRating(data.rating);
        setComment(data.comment || "");
      } else {
        console.log("ℹ️ No existing rating found");
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
      console.log("📊 Fetching average rating for giver:", giverId);

      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("rating")
        .eq("giver_id", giverId);

      if (error) {
        console.error("Error fetching average rating:", error);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + item.rating, 0);
        const average = total / data.length;
        setAverageRating(average);
        setTotalRatings(data.length);
        console.log(
          `📊 Average rating: ${average.toFixed(1)} (${data.length} avis)`
        );
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("❌ Error fetching average rating:", error);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    // Validation améliorée
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
      const ratingData = {
        listing_id: listingId,
        giver_id: giverId,
        receiver_id: user.id,
        rating: rating,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Submitting rating with data:", ratingData);

      let result;
      if (existingRating) {
        // Mettre à jour l'évaluation existante
        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .update({
            rating: rating,
            comment: comment.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRating.id);
      } else {
        // Créer une nouvelle évaluation
        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .insert(ratingData);
      }

      if (result.error) {
        console.error("❌ Supabase error:", result.error);
        throw result.error;
      }

      console.log("✅ Rating submitted successfully");

      alert(
        existingRating
          ? "Évaluation mise à jour avec succès !"
          : "Évaluation soumise avec succès !"
      );

      setShowForm(false);
      // Recharger les données
      await checkExistingRating();
      await fetchAverageRating();

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

  const renderStars = (value, interactive = false, size = "medium") => {
    const starSize = {
      small: "1rem",
      medium: "1.25rem",
      large: "1.5rem",
    }[size];

    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${star <= value ? "filled" : ""} ${
          interactive ? "interactive" : ""
        } ${size}`}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setRating(star) : undefined}
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
          {totalRatings > 1 ? "avis" : "avis"})
        </span>
      </div>
    );
  };

  // Ne pas afficher si l'utilisateur évalue sa propre annonce
  if (!user || user.id === giverId) {
    return null;
  }

  return (
    <div className="rating-system">
      {/* Affichage de la note moyenne */}
      {totalRatings > 0 && (
        <div className="average-rating-section">
          <h4>Note moyenne du propriétaire</h4>
          {renderAverageStars(averageRating, "medium")}
        </div>
      )}

      {/* Système d'évaluation personnel */}
      {existingRating ? (
        <div className="existing-rating">
          <div className="rating-header">
            <h4>Votre évaluation</h4>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setShowForm(!showForm)}
              disabled={submitting}
            >
              {showForm ? "Annuler" : "Modifier"}
            </button>
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
            </div>
          )}
        </div>
      ) : (
        <div className="no-rating">
          <button
            className="btn btn-primary btn-xs"
            onClick={() => setShowForm(true)}
            disabled={submitting}
          >
            ⭐ Évaluer
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmitRating} className="rating-form">
          <div className="form-group">
            <label>Note (obligatoire)</label>
            <div className="stars-input">
              {renderStars(rating, true, "medium")}
              <div className="rating-value">
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
              placeholder="Partagez votre expérience avec cette annonce..."
              rows="3"
              maxLength="500"
              disabled={submitting}
            />
            <small>{comment.length}/500 caractères</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-xs"
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
  );
};

export default RatingSystem;
