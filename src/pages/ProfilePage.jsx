import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ListingCard from "../components/ListingCard.jsx";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchUserListings();
    fetchUserReservations();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await superbase
        .from("profiles_2025_10_29_18_05")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserListings = async () => {
    try {
      const { data, error } = await superbase
        .from("listings_2025_10_29_18_05")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserListings(data || []);
    } catch (error) {
      console.error("Error fetching user listings:", error);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await superbase
        .from("reservations_2025_10_29_18_05")
        .select(
          `
          *,
          listings_2025_10_29_18_05 (
            title,
            fruit_type,
            address,
            photos
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserReservations(data || []);
    } catch (error) {
      console.error("Error fetching user reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const { error } = await superbase
        .from("profiles_2025_10_29_18_05")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...formData }));
      setEditMode(false);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  const handleListingToggle = async (listingId, isActive) => {
    try {
      const { error } = await superbase
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
      const { error } = await superbase
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "warning";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "completed":
        return "Terminée";
      default:
        return "En attente";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
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
              <div className="profile-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="profile-details">
                <h1>{profile?.full_name || "Utilisateur"}</h1>
                <p className="profile-email">{user.email}</p>
                <p className="profile-joined">
                  Membre depuis {formatDate(profile?.created_at)}
                </p>
              </div>
            </div>
            <div className="profile-actions">
              <button
                className="btn btn-outline"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Annuler" : "Modifier le profil"}
              </button>
              <button className="btn btn-danger" onClick={signOut}>
                Déconnexion
              </button>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profil
            </button>
            <button
              className={`tab-button ${
                activeTab === "listings" ? "active" : ""
              }`}
              onClick={() => setActiveTab("listings")}
            >
              Mes annonces ({userListings.length})
            </button>
            <button
              className={`tab-button ${
                activeTab === "reservations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("reservations")}
            >
              Mes réservations ({userReservations.length})
            </button>
          </div>

          <div className="profile-content">
            {activeTab === "profile" && (
              <div className="profile-tab">
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="full_name">Nom complet</label>
                      <input
                        type="text"
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Téléphone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Adresse</label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setEditMode(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-display">
                    <div className="info-card">
                      <h3>Informations personnelles</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Nom complet</label>
                          <span>{profile?.full_name || "Non renseigné"}</span>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <span>{user.email}</span>
                        </div>
                        <div className="info-item">
                          <label>Téléphone</label>
                          <span>{profile?.phone || "Non renseigné"}</span>
                        </div>
                        <div className="info-item">
                          <label>Adresse</label>
                          <span>{profile?.address || "Non renseignée"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "listings" && (
              <div className="listings-tab">
                <div className="tab-header">
                  <h2>Mes annonces</h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/create-listing")}
                  >
                    Nouvelle annonce
                  </button>
                </div>

                {userListings.length > 0 ? (
                  <div className="listings-grid">
                    {userListings.map((listing) => (
                      <div key={listing.id} className="listing-item">
                        <ListingCard listing={listing} />
                        <div className="listing-actions">
                          <button
                            className={`btn btn-sm ${
                              listing.is_active ? "btn-warning" : "btn-success"
                            }`}
                            onClick={() =>
                              handleListingToggle(
                                listing.id,
                                !listing.is_active
                              )
                            }
                          >
                            {listing.is_active ? "Désactiver" : "Activer"}
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            Voir
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleListingDelete(listing.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
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
            )}

            {activeTab === "reservations" && (
              <div className="reservations-tab">
                <h2>Mes réservations</h2>

                {userReservations.length > 0 ? (
                  <div className="reservations-list">
                    {userReservations.map((reservation) => (
                      <div key={reservation.id} className="reservation-item">
                        <div className="reservation-info">
                          <div className="reservation-listing">
                            {reservation.listings_2025_10_29_18_05
                              ?.photos?.[0] && (
                              <img
                                src={
                                  reservation.listings_2025_10_29_18_05
                                    .photos[0]
                                }
                                alt="Annonce"
                                className="reservation-photo"
                              />
                            )}
                            <div className="reservation-details">
                              <h4>
                                {reservation.listings_2025_10_29_18_05?.title}
                              </h4>
                              <p className="reservation-type">
                                🍓{" "}
                                {
                                  reservation.listings_2025_10_29_18_05
                                    ?.fruit_type
                                }
                              </p>
                              <p className="reservation-address">
                                📍{" "}
                                {reservation.listings_2025_10_29_18_05?.address}
                              </p>
                            </div>
                          </div>
                          <div className="reservation-meta">
                            <div className="reservation-date">
                              <strong>Date prévue:</strong>
                              <br />
                              {formatDate(reservation.scheduled_date)}
                            </div>
                            <div
                              className={`reservation-status status-${getStatusColor(
                                reservation.status
                              )}`}
                            >
                              {getStatusText(reservation.status)}
                            </div>
                          </div>
                        </div>
                        {reservation.message && (
                          <div className="reservation-message">
                            <strong>Message:</strong> {reservation.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">📅</span>
                    <h3>Aucune réservation</h3>
                    <p>Vous n'avez pas encore fait de réservation</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/")}
                    >
                      Parcourir les annonces
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
