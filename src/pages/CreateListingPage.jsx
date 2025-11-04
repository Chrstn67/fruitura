import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/CreateListingPage.css";

const CreateListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fruitType: "",
    price: "",
    isFree: false,
    canPickFromTree: true,
    canPickFromGround: true,
    ownerPresenceRequired: false,
    availableTimes: "",
    address: "",
    photos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const fruitTypes = [
    "Pommes",
    "Poires",
    "Cerises",
    "Prunes",
    "Abricots",
    "Pêches",
    "Tomates",
    "Courgettes",
    "Concombres",
    "Radis",
    "Carottes",
    "Salades",
    "Épinards",
    "Haricots",
    "Petits pois",
    "Autres",
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await superbase.storage
          .from("listing-photos")
          .upload(fileName, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = superbase.storage.from("listing-photos").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Error uploading photos:", error);
      setError("Erreur lors du téléchargement des photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await superbase
        .from("listings_2025_10_29_18_05")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          fruit_type: formData.fruitType,
          price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
          is_free: formData.isFree,
          can_pick_from_tree: formData.canPickFromTree,
          can_pick_from_ground: formData.canPickFromGround,
          owner_presence_required: formData.ownerPresenceRequired,
          available_times: formData.availableTimes,
          address: formData.address,
          photos: formData.photos,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/listing/${data.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      setError("Erreur lors de la création de l'annonce");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="create-listing-page">
      <Header />

      <main className="main-content">
        <div className="container container-sm">
          <div className="create-listing-container">
            <div className="page-header">
              <h1>Publier une annonce</h1>
              <p>Partagez vos fruits et légumes avec votre communauté</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="listing-form">
              <div className="form-section">
                <h3>Informations générales</h3>

                <div className="form-group">
                  <label htmlFor="title">Titre de l'annonce *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Pommes bio à cueillir dans mon jardin"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fruitType">Type de fruit/légume *</label>
                  <select
                    id="fruitType"
                    name="fruitType"
                    value={formData.fruitType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    {fruitTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Décrivez vos fruits/légumes, leur état, quantité disponible..."
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Prix et conditions</h3>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Gratuit
                  </label>
                </div>

                {!formData.isFree && (
                  <div className="form-group">
                    <label htmlFor="price">Prix (€)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="Prix en euros"
                    />
                  </div>
                )}

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="canPickFromTree"
                      checked={formData.canPickFromTree}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Cueillette sur l'arbre autorisée
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="canPickFromGround"
                      checked={formData.canPickFromGround}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Ramassage au sol autorisé
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="ownerPresenceRequired"
                      checked={formData.ownerPresenceRequired}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Ma présence est requise
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Disponibilité et localisation</h3>

                <div className="form-group">
                  <label htmlFor="availableTimes">
                    Créneaux de disponibilité
                  </label>
                  <textarea
                    id="availableTimes"
                    name="availableTimes"
                    value={formData.availableTimes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ex: Lundi-Vendredi 18h-20h, Weekend 9h-18h"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Adresse *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Votre adresse (ville, quartier...)"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Photos</h3>

                <div className="photo-upload">
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos}
                  />
                  <label htmlFor="photos" className="upload-label">
                    {uploadingPhotos
                      ? "Téléchargement..."
                      : "Ajouter des photos"}
                  </label>
                </div>

                {formData.photos.length > 0 && (
                  <div className="photo-preview">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img src={photo} alt={`Photo ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-photo"
                          onClick={() => removePhoto(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/")}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || uploadingPhotos}
                >
                  {loading ? "Publication..." : "Publier l'annonce"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListingPage;
