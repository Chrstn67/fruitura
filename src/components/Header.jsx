import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./App.jsx";
import { supabase } from "../integrations/supabase/client.js";
import "../styles/Header.css";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      checkAdminStatus();

      // Écouter les nouveaux messages en temps réel
      const subscription = supabase
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
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
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

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles_2025_10_29_18_05")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
    setIsAdmin(false);
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
            <img src="/Logo-Fruitura.png" className="logo-icon" />
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
                {/* Lien Admin conditionnel */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-link nav-link-admin"
                    onClick={closeMenu}
                  >
                    <span className="admin-icon">👑</span>
                    Dashboard
                  </Link>
                )}
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
