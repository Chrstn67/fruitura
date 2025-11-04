import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ListingCard from "../components/ListingCard.jsx";
import Map from "../components/Map.jsx";
import "../styles/HomePage.css";

const HomePage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'map'

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);

      let query = superbase
        .from("listings_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!user_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Récupérer les favoris de l'utilisateur si connecté
      let favoritesData = [];
      if (user) {
        const { data: favorites } = await superbase
          .from("user_favorites_2025_10_29_18_05")
          .select("listing_id")
          .eq("user_id", user.id);

        favoritesData = favorites?.map((f) => f.listing_id) || [];
      }

      // Récupérer les notes moyennes
      const listingsWithExtras = await Promise.all(
        data.map(async (listing) => {
          const { data: ratings } = await superbase
            .from("ratings_2025_10_29_18_05")
            .select("rating")
            .eq("giver_id", listing.user_id);

          const averageRating =
            ratings?.length > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              : 0;

          return {
            ...listing,
            is_favorite: favoritesData.includes(listing.id),
            average_rating: averageRating,
            rating_count: ratings?.length || 0,
          };
        })
      );

      setListings(listingsWithExtras);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (filters.fruitType) {
      filtered = filtered.filter(
        (listing) => listing.fruit_type === filters.fruitType
      );
    }

    if (filters.priceType) {
      if (filters.priceType === "free") {
        filtered = filtered.filter((listing) => listing.is_free);
      } else if (filters.priceType === "paid") {
        filtered = filtered.filter((listing) => !listing.is_free);
      }
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (listing) => listing.average_rating >= parseInt(filters.minRating)
      );
    }

    if (filters.availableDate) {
      const filterDate = new Date(filters.availableDate);
      filtered = filtered.filter(
        (listing) => new Date(listing.created_at) >= filterDate
      );
    }

    setFilteredListings(filtered);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFavoriteToggle = (listingId, isFavorite) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId
          ? { ...listing, is_favorite: isFavorite }
          : listing
      )
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Partagez vos fruits et légumes</h1>
              <p>
                Réduisez le gaspillage alimentaire en partageant vos récoltes
                avec votre communauté
              </p>
              {!user && (
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Rejoindre la communauté
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <FilterBar onFiltersChange={handleFiltersChange} filters={filters} />

        <section className="listings-section">
          <div className="container">
            <div className="section-header">
              <h2>Annonces disponibles ({filteredListings.length})</h2>
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  📋 Liste
                </button>
                <button
                  className={`view-btn ${viewMode === "map" ? "active" : ""}`}
                  onClick={() => setViewMode("map")}
                >
                  🗺️ Carte
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="listings-content">
                <div className="listings-grid">
                  {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))
                  ) : (
                    <div className="no-listings">
                      <div className="no-listings-content">
                        <span className="no-listings-icon">🍎</span>
                        <h3>Aucune annonce trouvée</h3>
                        <p>
                          Essayez de modifier vos filtres ou soyez le premier à
                          publier une annonce !
                        </p>
                        {user && (
                          <Link
                            to="/create-listing"
                            className="btn btn-primary"
                          >
                            Publier une annonce
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="map-view-container">
                <Map listings={filteredListings} />
              </div>
            )}
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{listings.length}</div>
                <div className="stat-label">Annonces actives</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {listings.filter((l) => l.is_free).length}
                </div>
                <div className="stat-label">Offres gratuites</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {new Set(listings.map((l) => l.fruit_type)).size}
                </div>
                <div className="stat-label">Types de fruits/légumes</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
