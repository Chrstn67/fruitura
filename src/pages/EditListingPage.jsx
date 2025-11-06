import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/CreateListingPage.css";

const EditListingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fruit_type: "",
    price: "",
    is_free: true,
    can_pick_from_tree: false,
    can_pick_from_ground: false,
    owner_presence_required: false,
    available_times: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchListing();
  }, [user, id, navigate]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("listings_2025_10_29_18_05")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Vérifier que l'utilisateur est propriétaire de l'annonce
      if (data.user_id !== user.id) {
        alert("Vous n'êtes pas autorisé à modifier cette annonce");
        navigate("/profile");
        return;
      }

      setListing(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        fruit_type: data.fruit_type || "",
        price: data.is_free ? "" : data.price.toString(),
        is_free: data.is_free || false,
        can_pick_from_tree: data.can_pick_from_tree || false,
        can_pick_from_ground: data.can_pick_from_ground || false,
        owner_presence_required: data.owner_presence_required || false,
        available_times: data.available_times || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Error fetching listing:", error);
      alert("Erreur lors du chargement de l'annonce");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceTypeChange = (isFree) => {
    setFormData((prev) => ({
      ...prev,
      is_free: isFree,
      price: isFree ? "" : prev.price,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simplifiée
    if (!formData.title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }
    // if (!formData.description.trim()) {
    //   alert("La description est obligatoire");
    //   return;
    // }
    if (!formData.fruit_type) {
      alert("Le type de fruit/légume est obligatoire");
      return;
    }
    if (!formData.address.trim()) {
      alert("L'adresse est obligatoire");
      return;
    }
    // if (!formData.available_times.trim()) {
    //   alert("Les horaires de disponibilité sont obligatoires");
    //   return;
    // }

    if (
      !formData.is_free &&
      (!formData.price || parseFloat(formData.price) <= 0)
    ) {
      alert("Veuillez indiquer un prix valide pour une annonce payante");
      return;
    }

    if (!formData.can_pick_from_tree && !formData.can_pick_from_ground) {
      alert("Veuillez sélectionner au moins une option de cueillette");
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        fruit_type: formData.fruit_type,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        is_free: formData.is_free,
        can_pick_from_tree: formData.can_pick_from_tree,
        can_pick_from_ground: formData.can_pick_from_ground,
        owner_presence_required: formData.owner_presence_required,
        available_times: formData.available_times,
        address: formData.address,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("listings_2025_10_29_18_05")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      alert("Annonce mise à jour avec succès !");
      navigate("/profile/listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Erreur lors de la mise à jour de l'annonce");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de l'annonce...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="create-listing-page">
        <Header />
        <main className="main-content">
          <div className="container">
            <div className="error-message">
              <h1>Annonce introuvable</h1>
              <p>
                L'annonce que vous tentez de modifier n'existe pas ou a été
                supprimée.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="create-listing-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="page-header">
            <h1>Modifier mon annonce</h1>
            <p>Mettez à jour les informations de votre annonce</p>
          </div>

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-section">
              <h2>Informations générales</h2>

              <div className="form-group">
                <label htmlFor="title">Titre de l'annonce *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Pommes bio de mon jardin"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez vos fruits/légumes, leur état, variété..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fruit_type">Type de fruit/légume *</label>
                <select
                  id="fruit_type"
                  name="fruit_type"
                  value={formData.fruit_type}
                  onChange={handleInputChange}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Pommes">Pommes</option>
                  <option value="Poires">Poires</option>
                  <option value="Cerises">Cerises</option>
                  <option value="Prunes">Prunes</option>
                  <option value="Abricots">Abricots</option>
                  <option value="Pêches">Pêches</option>
                  <option value="Raisins">Raisins</option>
                  <option value="Tomates">Tomates</option>
                  <option value="Courgettes">Courgettes</option>
                  <option value="Aubergines">Aubergines</option>
                  <option value="Poivrons">Poivrons</option>
                  <option value="Concombres">Concombres</option>
                  <option value="Radis">Radis</option>
                  <option value="Carottes">Carottes</option>
                  <option value="Salades">Salades</option>
                  <option value="Épinards">Épinards</option>
                  <option value="Haricots">Haricots</option>
                  <option value="Petits pois">Petits pois</option>
                  <option value="Courges">Courges</option>
                  <option value="Potirons">Potirons</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h2>Prix et conditions</h2>

              <div className="form-group">
                <label>Type d'offre *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="price_type"
                      checked={formData.is_free}
                      onChange={() => handlePriceTypeChange(true)}
                    />
                    <span className="radio-label">Gratuit</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="price_type"
                      checked={!formData.is_free}
                      onChange={() => handlePriceTypeChange(false)}
                    />
                    <span className="radio-label">Payant</span>
                  </label>
                </div>
              </div>

              {!formData.is_free && (
                <div className="form-group">
                  <label htmlFor="price">Prix (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Options de cueillette *</label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      name="can_pick_from_tree"
                      checked={formData.can_pick_from_tree}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-label">
                      Cueillette directe sur l'arbre/plant
                    </span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      name="can_pick_from_ground"
                      checked={formData.can_pick_from_ground}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-label">
                      Ramassage au sol autorisé
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    name="owner_presence_required"
                    checked={formData.owner_presence_required}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-label">
                    Ma présence est requise lors de la cueillette
                  </span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Disponibilité et localisation</h2>

              <div className="form-group">
                <label htmlFor="available_times">
                  Horaires de disponibilité *
                </label>
                <textarea
                  id="available_times"
                  name="available_times"
                  value={formData.available_times}
                  onChange={handleInputChange}
                  placeholder="Ex: Tous les jours de 9h à 18h, weekend inclus"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ville, quartier ou adresse approximative"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/profile/listings")}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Mise à jour..." : "Mettre à jour l'annonce"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListingPage;
