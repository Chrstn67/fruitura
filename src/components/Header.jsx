import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/App";
import { superbase } from "../integrations/superbase/client.js";
import "../styles/Header.css";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Écouter les nouveaux messages en temps réel
      const subscription = superbase
        .channel("messages-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages_2025_10_29_18_05",
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await superbase
        .from("messages_2025_10_29_18_05")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">🍎</span>
            <span className="logo-text">Fruitura</span>
          </Link>

          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Accueil
            </Link>
            {user ? (
              <>
                <Link
                  to="/create-listing"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Publier une annonce
                </Link>
                <Link
                  to="/messages"
                  className="nav-link nav-link-with-badge"
                  onClick={closeMenu}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="unread-badge-header">{unreadCount}</span>
                  )}
                </Link>
                <Link to="/favorites" className="nav-link" onClick={closeMenu}>
                  Favoris
                </Link>
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline btn-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>

          <div
            className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
            {unreadCount > 0 && (
              <span className="mobile-badge-indicator"></span>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu en cliquant à côté */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}
    </header>
  );
};

export default Header;
