import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ListingCard from "../components/ListingCard.jsx";
import "../styles/FavoritesPage.css";

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_favorites_2025_10_29_18_05")
        .select(
          `
          *,
          listings_2025_10_29_18_05 (
            *,
            profiles_2025_10_29_18_05!user_id (
              full_name,
              avatar_url
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Récupérer les notes moyennes pour chaque annonce
      const favoritesWithRatings = await Promise.all(
        (data || []).map(async (favorite) => {
          const listing = favorite.listings_2025_10_29_18_05;

          const { data: ratings } = await supabase
            .from("ratings_2025_10_29_18_05")
            .select("rating")
            .eq("giver_id", listing.user_id);

          const averageRating =
            ratings?.length > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              : 0;

          return {
            ...favorite,
            listings_2025_10_29_18_05: {
              ...listing,
              is_favorite: true,
              average_rating: averageRating,
              rating_count: ratings?.length || 0,
            },
          };
        })
      );

      setFavorites(favoritesWithRatings);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (listingId, isFavorite) => {
    if (!isFavorite) {
      // Supprimer des favoris
      setFavorites((prev) =>
        prev.filter((fav) => fav.listing_id !== listingId)
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de vos favoris...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1>Mes favoris</h1>
            <p>Retrouvez toutes les annonces que vous avez sauvegardées</p>
          </div>

          {favorites.length > 0 ? (
            <div className="favorites-content">
              <div className="favorites-stats">
                <div className="stat-item">
                  <span className="stat-number">{favorites.length}</span>
                  <span className="stat-label">Annonces favorites</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {
                      favorites.filter(
                        (fav) => fav.listings_2025_10_29_18_05?.is_free
                      ).length
                    }
                  </span>
                  <span className="stat-label">Offres gratuites</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {
                      new Set(
                        favorites.map(
                          (fav) => fav.listings_2025_10_29_18_05?.fruit_type
                        )
                      ).size
                    }
                  </span>
                  <span className="stat-label">Types différents</span>
                </div>
              </div>

              <div className="favorites-grid">
                {favorites.map((favorite) => (
                  <ListingCard
                    key={favorite.id}
                    listing={favorite.listings_2025_10_29_18_05}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-favorites">
              <div className="empty-content">
                <span className="empty-icon">❤️</span>
                <h2>Aucun favori pour le moment</h2>
                <p>
                  Parcourez les annonces et cliquez sur le cœur pour ajouter vos
                  fruits et légumes préférés à vos favoris.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate("/")}
                >
                  Découvrir les annonces
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
