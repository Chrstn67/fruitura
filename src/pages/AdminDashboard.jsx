import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
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
      const { data, error } = await supabase
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
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Statistiques des utilisateurs
      const { data: usersData } = await supabase
        .from("profiles_2025_10_29_18_05")
        .select("id, created_at, is_admin");

      // Statistiques des annonces
      const { data: listingsData } = await supabase
        .from("listings_2025_10_29_18_05")
        .select("id, created_at, is_active, is_free");

      // Statistiques des messages
      const { data: messagesData } = await supabase
        .from("messages_2025_10_29_18_05")
        .select("id, created_at");

      // Statistiques des évaluations
      const { data: ratingsData } = await supabase
        .from("ratings_2025_10_29_18_05")
        .select("rating");

      const totalUsers = usersData?.length || 0;
      const adminUsers = usersData?.filter((u) => u.is_admin).length || 0;
      const totalListings = listingsData?.length || 0;
      const activeListings =
        listingsData?.filter((l) => l.is_active).length || 0;
      const freeListings = listingsData?.filter((l) => l.is_free).length || 0;
      const totalMessages = messagesData?.length || 0;
      const totalRatings = ratingsData?.length || 0;
      const averageRating =
        ratingsData?.length > 0
          ? (
              ratingsData.reduce((sum, r) => sum + r.rating, 0) /
              ratingsData.length
            ).toFixed(1)
          : 0;

      // Utilisateurs récents (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers =
        usersData?.filter((u) => new Date(u.created_at) > thirtyDaysAgo)
          .length || 0;

      setStats({
        totalUsers,
        adminUsers,
        recentUsers,
        totalListings,
        activeListings,
        freeListings,
        totalMessages,
        totalRatings,
        averageRating,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
    // Vérifier qu'on ne se retire pas ses propres droits admin
    if (userId === user.id && currentStatus === true) {
      alert("Vous ne pouvez pas retirer vos propres droits d'administrateur !");
      return;
    }

    // Confirmer l'action
    const action = currentStatus ? "rétrograder" : "promouvoir";
    const userToUpdate = users.find((u) => u.id === userId);
    const confirmMessage = `Êtes-vous sûr de vouloir ${action} ${
      userToUpdate?.full_name || userToUpdate?.email
    } ?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles_2025_10_29_18_05")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        )
      );

      const successAction = currentStatus
        ? "rétrogadé"
        : "promu administrateur";
      alert(
        `${
          userToUpdate?.full_name || userToUpdate?.email
        } a été ${successAction} avec succès !`
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Erreur lors de la mise à jour du statut utilisateur");
    }
  };

  const toggleListingStatus = async (listingId, currentStatus) => {
    const action = currentStatus ? "désactiver" : "activer";
    const listing = listings.find((l) => l.id === listingId);

    if (
      !confirm(
        `Êtes-vous sûr de vouloir ${action} l'annonce "${listing?.title}" ?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
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

      alert(
        `Annonce ${currentStatus ? "désactivée" : "activée"} avec succès !`
      );
    } catch (error) {
      console.error("Error updating listing status:", error);
      alert("Erreur lors de la mise à jour de l'annonce");
    }
  };

  const deleteListing = async (listingId) => {
    const listing = listings.find((l) => l.id === listingId);

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement l'annonce "${listing?.title}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("listings_2025_10_29_18_05")
        .delete()
        .eq("id", listingId);

      if (error) throw error;

      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      alert("Annonce supprimée avec succès !");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Erreur lors de la suppression de l'annonce");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification des droits administrateur...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <Header />
        <main className="main-content">
          <div className="container">
            <div className="access-denied">
              <h1>Accès refusé</h1>
              <p>
                Vous n'avez pas les droits administrateur nécessaires pour
                accéder à cette page.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="admin-header">
            <h1>Tableau de bord administrateur</h1>
            <p>Gérez votre plateforme Fruitura</p>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Vue d'ensemble
            </button>
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Utilisateurs ({users.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "listings" ? "active" : ""}`}
              onClick={() => setActiveTab("listings")}
            >
              📝 Annonces ({listings.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => setActiveTab("messages")}
            >
              💬 Messages admin
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
                      <div className="stat-label">Utilisateurs total</div>
                      <div className="stat-detail">
                        {stats.recentUsers} nouveaux ce mois
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">👑</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.adminUsers}</div>
                      <div className="stat-label">Administrateurs</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.totalListings}</div>
                      <div className="stat-label">Annonces total</div>
                      <div className="stat-detail">
                        {stats.activeListings} actives
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🆓</div>
                    <div className="stat-info">
                      <div className="stat-number">{stats.freeListings}</div>
                      <div className="stat-label">Offres gratuites</div>
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
                      <div className="stat-detail">
                        {stats.totalRatings} évaluations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="users-tab">
                <div className="tab-header">
                  <h2>Gestion des utilisateurs</h2>
                  <p>Gérez les droits et statuts des utilisateurs</p>
                </div>

                <div className="users-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Inscription</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {userItem.avatar_url ? (
                                  <img src={userItem.avatar_url} alt="Avatar" />
                                ) : (
                                  <span>👤</span>
                                )}
                              </div>
                              <div>
                                <div className="user-name">
                                  {userItem.full_name || "Nom non défini"}
                                </div>
                                {userItem.id === user.id && (
                                  <span className="current-user-badge">
                                    Vous
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{userItem.email}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                userItem.is_admin ? "admin" : "user"
                              }`}
                            >
                              {userItem.is_admin
                                ? "👑 Admin"
                                : "👤 Utilisateur"}
                            </span>
                          </td>
                          <td>{formatDate(userItem.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className={`btn btn-sm ${
                                  userItem.is_admin
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                                onClick={() =>
                                  toggleUserStatus(
                                    userItem.id,
                                    userItem.is_admin
                                  )
                                }
                                disabled={
                                  userItem.id === user.id && userItem.is_admin
                                }
                              >
                                {userItem.is_admin
                                  ? "⬇️ Rétrograder"
                                  : "⬆️ Promouvoir Admin"}
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
                <div className="tab-header">
                  <h2>Gestion des annonces</h2>
                  <p>Modérez et gérez toutes les annonces de la plateforme</p>
                </div>

                <div className="listings-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Annonce</th>
                        <th>Propriétaire</th>
                        <th>Type</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => (
                        <tr key={listing.id}>
                          <td>
                            <div className="listing-info">
                              <div className="listing-title">
                                {listing.title}
                              </div>
                              <div className="listing-description">
                                {listing.description.length > 50
                                  ? `${listing.description.substring(0, 50)}...`
                                  : listing.description}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="owner-info">
                              <div>
                                {listing.profiles_2025_10_29_18_05?.full_name ||
                                  "Nom non défini"}
                              </div>
                              <div className="owner-email">
                                {listing.profiles_2025_10_29_18_05?.email}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="fruit-type-badge">
                              {listing.fruit_type}
                            </span>
                          </td>
                          <td>
                            {listing.is_free ? (
                              <span className="price-free">Gratuit</span>
                            ) : (
                              <span className="price-paid">
                                {listing.price}€
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                listing.is_active ? "active" : "inactive"
                              }`}
                            >
                              {listing.is_active ? "✅ Active" : "❌ Inactive"}
                            </span>
                          </td>
                          <td>{formatDate(listing.created_at)}</td>
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
                                {listing.is_active
                                  ? "⏸️ Désactiver"
                                  : "▶️ Activer"}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteListing(listing.id)}
                              >
                                🗑️ Supprimer
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
                <div className="tab-header">
                  <h2>Messages administrateur</h2>
                  <p>Messages et signalements des utilisateurs</p>
                </div>

                {messages.length > 0 ? (
                  <div className="admin-messages-list">
                    {messages.map((message) => (
                      <div key={message.id} className="admin-message-card">
                        <div className="message-header">
                          <div className="message-user">
                            <strong>
                              {message.profiles_2025_10_29_18_05?.full_name ||
                                "Utilisateur"}
                            </strong>
                            <span className="message-email">
                              ({message.profiles_2025_10_29_18_05?.email})
                            </span>
                          </div>
                          <div className="message-date">
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                        <div className="message-content">
                          <p>
                            <strong>Sujet:</strong> {message.subject}
                          </p>
                          <p>{message.content}</p>
                        </div>
                        <div className="message-status">
                          <span
                            className={`status-badge ${
                              message.is_resolved ? "resolved" : "pending"
                            }`}
                          >
                            {message.is_resolved
                              ? "✅ Résolu"
                              : "⏳ En attente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-messages">
                    <div className="no-messages-icon">📭</div>
                    <h3>Aucun message administrateur</h3>
                    <p>
                      Aucun message ou signalement n'a été reçu pour le moment.
                    </p>
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

export default AdminDashboard;
