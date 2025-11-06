import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ListingCard from "../components/ListingCard.jsx";
import "../styles/ProfilePage.css";

const ProfileListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserListings();
  }, [user, navigate]);

  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings_2025_10_29_18_05")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserListings(data || []);
    } catch (error) {
      console.error("Error fetching user listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleListingToggle = async (listingId, isActive) => {
    try {
      const { error } = await supabase
        .from("listings_2025_10_29_18_05")
        .update({ is_active: isActive })
        .eq("id", listingId);

      if (error) throw error;

      setUserListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, is_active: isActive }
            : listing
        )
      );
    } catch (error) {
      console.error("Error toggling listing:", error);
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("listings_2025_10_29_18_05")
        .delete()
        .eq("id", listingId);

      if (error) throw error;

      setUserListings((prev) =>
        prev.filter((listing) => listing.id !== listingId)
      );
      alert("Annonce supprimée avec succès");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleEditListing = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de vos annonces...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="profile-header">
            <div className="profile-info">
              <h1>Mes annonces</h1>
              <p>Gérez toutes vos annonces publiées</p>
            </div>
            <div className="profile-actions">
              <Link to="/profile" className="btn btn-outline">
                ← Retour au profil
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create-listing")}
              >
                Nouvelle annonce
              </button>
            </div>
          </div>

          <div className="profile-nav">
            <Link to="/profile" className="profile-nav-link">
              📊 Vue d'ensemble
            </Link>
            <Link to="/profile/listings" className="profile-nav-link active">
              📝 Mes annonces ({userListings.length})
            </Link>
            <Link to="/profile/reservations" className="profile-nav-link">
              📅 Mes réservations
            </Link>
          </div>

          <div className="profile-content">
            {userListings.length > 0 ? (
              <div className="listings-grid-container">
                <div className="listings-grid">
                  {userListings.map((listing) => (
                    <div key={listing.id} className="listing-item-wrapper">
                      <ListingCard listing={listing} />
                      <div className="listing-actions">
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEditListing(listing.id)}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          className={`btn btn-sm ${
                            listing.is_active ? "btn-warning" : "btn-success"
                          }`}
                          onClick={() =>
                            handleListingToggle(listing.id, !listing.is_active)
                          }
                        >
                          {listing.is_active ? "⏸️ Désactiver" : "▶️ Activer"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                        >
                          👁️ Voir
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleListingDelete(listing.id)}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>Aucune annonce</h3>
                <p>Vous n'avez pas encore publié d'annonce</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/create-listing")}
                >
                  Créer ma première annonce
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileListingsPage;
