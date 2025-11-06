import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/ProfilePage.css";

const ProfileReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserReservations();
  }, [user, navigate]);

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await supabase
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
        <p>Chargement de vos réservations...</p>
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
              <h1>Mes réservations</h1>
              <p>Consultez l'historique de vos réservations</p>
            </div>
            <div className="profile-actions">
              <Link to="/profile" className="btn btn-outline">
                ← Retour au profil
              </Link>
            </div>
          </div>

          <div className="profile-nav">
            <Link to="/profile" className="profile-nav-link">
              📊 Vue d'ensemble
            </Link>
            <Link to="/profile/listings" className="profile-nav-link">
              📝 Mes annonces
            </Link>
            <Link
              to="/profile/reservations"
              className="profile-nav-link active"
            >
              📅 Mes réservations ({userReservations.length})
            </Link>
          </div>

          <div className="profile-content">
            {userReservations.length > 0 ? (
              <div className="reservations-list">
                {userReservations.map((reservation) => (
                  <div key={reservation.id} className="reservation-item">
                    <div className="reservation-info">
                      <div className="reservation-listing">
                        {reservation.listings_2025_10_29_18_05?.photos?.[0] && (
                          <img
                            src={
                              reservation.listings_2025_10_29_18_05.photos[0]
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
                            {reservation.listings_2025_10_29_18_05?.fruit_type}
                          </p>
                          <p className="reservation-address">
                            📍 {reservation.listings_2025_10_29_18_05?.address}
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileReservationsPage;
