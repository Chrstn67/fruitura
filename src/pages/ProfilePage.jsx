import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
        .from("listings_2025_10_29_18_05")
        .select("id")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserListings(data || []);
    } catch (error) {
      console.error("Error fetching user listings:", error);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("reservations_2025_10_29_18_05")
        .select("id")
        .eq("user_id", user.id);

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

    // Validation simplifiée - seulement le nom complet est requis
    if (!formData.full_name.trim()) {
      alert("Le nom complet est obligatoire");
      return;
    }

    try {
      const { error } = await supabase
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

  // Même méthode de déconnexion que dans Header
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  // Protection contre user null (au cas où)
  if (!user) {
    return null; // ou redirection vers login
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
                <p className="profile-email">{user?.email}</p>
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
              <button
                className="btn btn-danger"
                onClick={handleSignOut} // Utilisation de la nouvelle méthode
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Navigation entre les pages profil */}
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
              📅 Mes réservations ({userReservations.length})
            </Link>
          </div>

          <div className="profile-content">
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="full_name">Nom complet *</label>
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
              <div className="profile-overview">
                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="overview-icon">📝</div>
                    <div className="overview-content">
                      <h3>Mes annonces</h3>
                      <p className="overview-count">{userListings.length}</p>
                      <p className="overview-description">Annonces publiées</p>
                      <Link
                        to="/profile/listings"
                        className="btn btn-outline btn-sm"
                      >
                        Gérer mes annonces
                      </Link>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-icon">📅</div>
                    <div className="overview-content">
                      <h3>Mes réservations</h3>
                      <p className="overview-count">
                        {userReservations.length}
                      </p>
                      <p className="overview-description">
                        Réservations effectuées
                      </p>
                      <Link
                        to="/profile/reservations"
                        className="btn btn-outline btn-sm"
                      >
                        Voir mes réservations
                      </Link>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-icon">⭐</div>
                    <div className="overview-content">
                      <h3>Activité récente</h3>
                      <p className="overview-description">
                        Dernière connexion aujourd'hui
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate("/create-listing")}
                      >
                        Créer une annonce
                      </button>
                    </div>
                  </div>
                </div>

                <div className="profile-info-card">
                  <h3>Informations personnelles</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Nom complet</label>
                      <span>{profile?.full_name || "Non renseigné"}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{user?.email}</span>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
