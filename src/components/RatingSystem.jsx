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

  useEffect(() => {
    if (user && listingId && giverId) {
      checkExistingRating();
    }
  }, [user, listingId, giverId]);

  const checkExistingRating = async () => {
    try {
      const { data, error } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("*")
        .eq("listing_id", listingId)
        .eq("giver_id", giverId)
        .eq("receiver_id", user.id)
        .single();

      if (data) {
        setExistingRating(data);
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error) {
      // Pas d'évaluation existante, c'est normal
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      alert("Veuillez sélectionner une note entre 1 et 5 étoiles");
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
      };

      let result;
      if (existingRating) {
        // Mettre à jour l'évaluation existante
        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .update(ratingData)
          .eq("id", existingRating.id);
      } else {
        // Créer une nouvelle évaluation
        result = await supabase
          .from("ratings_2025_10_29_18_05")
          .insert(ratingData);
      }

      if (result.error) throw result.error;

      alert(
        existingRating
          ? "Évaluation mise à jour avec succès !"
          : "Évaluation soumise avec succès !"
      );
      setShowForm(false);

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Erreur lors de la soumission de l'évaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${star <= rating ? "filled" : ""} ${
          interactive ? "interactive" : ""
        }`}
        onClick={interactive ? () => setRating(star) : undefined}
        disabled={!interactive}
      >
        ⭐
      </button>
    ));
  };

  // Ne pas afficher si l'utilisateur évalue sa propre annonce
  if (!user || user.id === giverId) {
    return null;
  }

  return (
    <div className="rating-system">
      {existingRating ? (
        <div className="existing-rating">
          <div className="rating-header">
            <h4>Votre évaluation</h4>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Annuler" : "Modifier"}
            </button>
          </div>
          {!showForm && (
            <div className="rating-display">
              <div className="stars-display">{renderStars(false)}</div>
              {existingRating.comment && (
                <p className="rating-comment">"{existingRating.comment}"</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="no-rating">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(true)}
          >
            ⭐ Évaluer cette annonce
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmitRating} className="rating-form">
          <div className="form-group">
            <label>Note (obligatoire)</label>
            <div className="stars-input">{renderStars(true)}</div>
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
            />
            <small>{comment.length}/500 caractères</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowForm(false)}
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
  );
};

export default RatingSystem;
