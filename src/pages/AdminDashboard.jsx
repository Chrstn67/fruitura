import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    checkAdminStatus();
  }, [user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await superbase
        .from("profiles_2025_10_29_18_05")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (!data.is_admin) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      switch (activeTab) {
        case "overview":
          await fetchStats();
          break;
        case "users":
          await fetchUsers();
          break;
        case "listings":
          await fetchListings();
          break;
        case "messages":
          await fetchAdminMessages();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Récupérer les statistiques générales
      const [usersResult, listingsResult, messagesResult, ratingsResult] =
        await Promise.all([
          superbase
            .from("profiles_2025_10_29_18_05")
            .select("id", { count: "exact" }),
          superbase
            .from("listings_2025_10_29_18_05")
            .select("id", { count: "exact" }),
          superbase
            .from("messages_2025_10_29_18_05")
            .select("id", { count: "exact" }),
          superbase.from("ratings_2025_10_29_18_05").select("rating"),
        ]);

      const averageRating =
        ratingsResult.data?.length > 0
          ? ratingsResult.data.reduce((sum, r) => sum + r.rating, 0) /
            ratingsResult.data.length
          : 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalListings: listingsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        averageRating: averageRating.toFixed(1),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await superbase
        .from("profiles_2025_10_29_18_05")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await superbase
        .from("listings_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!user_id (
            full_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const fetchAdminMessages = async () => {
    try {
      const { data, error } = await superbase
        .from("admin_messages_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!user_id (
            full_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await superbase
        .from("profiles_2025_10_29_18_05")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const toggleListingStatus = async (listingId, currentStatus) => {
    try {
      const { error } = await superbase
        .from("listings_2025_10_29_18_05")
        .update({ is_active: !currentStatus })
        .eq("id", listingId);

      if (error) throw error;

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, is_active: !currentStatus }
            : listing
        )
      );
    } catch (error) {
      console.error("Error updating listing status:", error);
    }
  };

  const deleteListing = async (listingId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const { error } = await superbase
        .from("listings_2025_10_29_18_05")
        .delete()
        .eq("id", listingId);

      if (error) throw error;

      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      alert("Annonce supprimée avec succès");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="admin-header">
            <h1>Tableau de bord administrateur</h1>
            <p>Gestion et modération de la plateforme Fruitura</p>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Vue d'ensemble
            </button>
            <button
              className={`tab-button ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs ({users.length})
            </button>
            <button
              className={`tab-button ${
                activeTab === "listings" ? "active" : ""
              }`}
              onClick={() => setActiveTab("listings")}
            >
              Annonces ({listings.length})
            </button>
            <button
              className={`tab-button ${
                activeTab === "messages" ? "active" : ""
              }`}
              onClick={() => setActiveTab("messages")}
            >
              Messages ({messages.length})
            </button>
          </div>

          <div className="admin-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.totalUsers}</div>
                      <div className="stat-label">Utilisateurs inscrits</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.totalListings}</div>
                      <div className="stat-label">Annonces publiées</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.totalMessages}</div>
                      <div className="stat-label">Messages échangés</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.averageRating}</div>
                      <div className="stat-label">Note moyenne</div>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h3>Activité récente</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-icon">👤</span>
                      <span className="activity-text">
                        Nouveaux utilisateurs cette semaine
                      </span>
                      <span className="activity-count">12</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">📝</span>
                      <span className="activity-text">
                        Nouvelles annonces cette semaine
                      </span>
                      <span className="activity-count">8</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">💬</span>
                      <span className="activity-text">Messages non lus</span>
                      <span className="activity-count">3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="users-tab">
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Inscription</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="Avatar" />
                                ) : (
                                  <span>👤</span>
                                )}
                              </div>
                              <span>{user.full_name || "Sans nom"}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone || "Non renseigné"}</td>
                          <td>{formatDate(user.created_at)}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                user.is_admin ? "admin" : "user"
                              }`}
                            >
                              {user.is_admin ? "Admin" : "Utilisateur"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className={`btn btn-sm ${
                                  user.is_admin ? "btn-warning" : "btn-success"
                                }`}
                                onClick={() =>
                                  toggleUserStatus(user.id, user.is_admin)
                                }
                              >
                                {user.is_admin ? "Rétrograder" : "Promouvoir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "listings" && (
              <div className="listings-tab">
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Annonce</th>
                        <th>Propriétaire</th>
                        <th>Type</th>
                        <th>Prix</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => (
                        <tr key={listing.id}>
                          <td>
                            <div className="listing-info">
                              {listing.photos?.[0] && (
                                <img
                                  src={listing.photos[0]}
                                  alt="Annonce"
                                  className="listing-thumb"
                                />
                              )}
                              <span>{listing.title}</span>
                            </div>
                          </td>
                          <td>
                            {listing.profiles_2025_10_29_18_05?.full_name ||
                              "Utilisateur"}
                          </td>
                          <td>{listing.fruit_type}</td>
                          <td>
                            {listing.is_free ? "Gratuit" : `${listing.price}€`}
                          </td>
                          <td>{formatDate(listing.created_at)}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                listing.is_active ? "active" : "inactive"
                              }`}
                            >
                              {listing.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className={`btn btn-sm ${
                                  listing.is_active
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                                onClick={() =>
                                  toggleListingStatus(
                                    listing.id,
                                    listing.is_active
                                  )
                                }
                              >
                                {listing.is_active ? "Désactiver" : "Activer"}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteListing(listing.id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="messages-tab">
                <div className="admin-messages">
                  <h3>Messages administrateur</h3>
                  <p>
                    Fonctionnalité de messagerie administrative en cours de
                    développement
                  </p>

                  <div className="message-form">
                    <h4>Envoyer un message à tous les utilisateurs</h4>
                    <form>
                      <div className="form-group">
                        <label>Sujet</label>
                        <input type="text" placeholder="Sujet du message" />
                      </div>
                      <div className="form-group">
                        <label>Message</label>
                        <textarea
                          rows="4"
                          placeholder="Contenu du message"
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Envoyer à tous
                      </button>
                    </form>
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

export default AdminDashboard;
