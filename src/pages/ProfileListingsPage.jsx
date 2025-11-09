import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ProfilePage.css";

const ProfileListingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
        .eq("id", listingId)
        .eq("user_id", user.id);

      if (error) throw error;

      setUserListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, is_active: isActive }
            : listing
        )
      );

      alert(`Annonce ${isActive ? "activée" : "désactivée"} avec succès`);
    } catch (error) {
      console.error("Error toggling listing:", error);
      alert("Erreur lors de la modification de l'annonce");
    }
  };

  const handleListingDelete = async (listingId) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("listings_2025_10_29_18_05")
        .delete()
        .eq("id", listingId)
        .eq("user_id", user.id);

      if (error) throw error;

      setUserListings((prev) =>
        prev.filter((listing) => listing.id !== listingId)
      );
      alert("Annonce supprimée avec succès");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Erreur lors de la suppression de l'annonce");
    }
  };

  const handleEditListing = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
              <button className="btn btn-danger" onClick={handleSignOut}>
                Déconnexion
              </button>
            </div>
          </div>

          <div className="profile-nav">
            <Link
              to="/profile"
              className={`profile-nav-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              📊 Vue d'ensemble
            </Link>
            <Link
              to="/profile/listings"
              className={`profile-nav-link ${
                location.pathname === "/profile/listings" ? "active" : ""
              }`}
            >
              📝 Mes annonces ({userListings.length})
            </Link>
            <Link
              to="/profile/reservations"
              className={`profile-nav-link ${
                location.pathname === "/profile/reservations" ? "active" : ""
              }`}
            >
              📅 Mes réservations
            </Link>
          </div>

          <div className="profile-content">
            {userListings.length > 0 ? (
              <div className="listings-management">
                <div className="listings-grid">
                  {userListings.map((listing) => (
                    <div key={listing.id} className="listing-management-card">
                      <div className="listing-header">
                        <div className="listing-image">
                          {listing.photos && listing.photos.length > 0 ? (
                            <img src={listing.photos[0]} alt={listing.title} />
                          ) : (
                            <div className="no-image">
                              <span>🍎</span>
                            </div>
                          )}
                          <div className="listing-status">
                            <span
                              className={`status-badge ${
                                listing.is_active ? "active" : "inactive"
                              }`}
                            >
                              {listing.is_active ? "🟢 Active" : "⏸️ Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="listing-info">
                          <h3>{listing.title}</h3>
                          <div className="listing-meta">
                            <span className="fruit-type">
                              🍓 {listing.fruit_type}
                            </span>
                            <span className="price">
                              {formatPrice(listing.price, listing.is_free)}
                            </span>
                            <span className="date">
                              📅 {formatDate(listing.created_at)}
                            </span>
                            <span className="address">
                              📍 {listing.address}
                            </span>
                          </div>

                          {listing.description && (
                            <p className="listing-description">
                              {listing.description.length > 150
                                ? `${listing.description.substring(0, 150)}...`
                                : listing.description}
                            </p>
                          )}

                          <div className="listing-features">
                            {listing.can_pick_from_tree && (
                              <span className="feature">
                                🌳 Cueillette sur arbre
                              </span>
                            )}
                            {listing.can_pick_from_ground && (
                              <span className="feature">
                                🍂 Ramassage au sol
                              </span>
                            )}
                            {listing.owner_presence_required && (
                              <span className="feature">
                                👤 Présence requise
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

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
