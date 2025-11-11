// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";

//Composants
import Header from "./Header.jsx";

// Pages
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ProfileListingsPage from "../pages/ProfileListingsPage.jsx";
import ProfileReservationsPage from "../pages/ProfileReservationsPage.jsx";
import CreateListingPage from "../pages/CreateListingPage.jsx";
import EditListingPage from "../pages/EditListingPage.jsx";
import ListingDetailPage from "../pages/ListingDetailPage.jsx";
import MessagesPage from "../pages/MessagesPage.jsx";
import FavoritesPage from "../pages/FavoritesPage.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import ContactPage from "../pages/ContactPage.jsx";
import TermsPage from "../pages/TermsPage.jsx";
import PrivacyPage from "../pages/PrivacyPage.jsx";

// Context pour l'authentification
const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Composant pour le scroll automatique
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      // URL de redirection après confirmation email
      const redirectUrl = "https://fruitura.vercel.app/#/login";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...userData,
            // Ajoutez des métadonnées supplémentaires si nécessaire
            website_url: "https://fruitura.vercel.app",
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const authValue = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div className="App">
        <ScrollToTop />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes profil améliorées */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/listings" element={<ProfileListingsPage />} />
            <Route
              path="/profile/reservations"
              element={<ProfileReservationsPage />}
            />

            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/edit-listing/:id" element={<EditListingPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
