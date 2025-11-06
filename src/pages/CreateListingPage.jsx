import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { searchAddresses, geocodeAddress } from "../services/geocoding.js";
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
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressCoordinates, setAddressCoordinates] = useState(null);

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

  const handleAddressSearch = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const suggestions = await searchAddresses(query);
      setAddressSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = async (suggestion) => {
    setFormData((prev) => ({ ...prev, address: suggestion.label }));
    setShowSuggestions(false);

    try {
      const coords = await geocodeAddress(suggestion.label);
      setAddressCoordinates(coords);
    } catch (error) {
      console.error("Erreur lors du géocodage:", error);
      setAddressCoordinates(null);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Les photos ne doivent pas dépasser 5MB");
          continue;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
          setError("Veuillez uploader uniquement des images");
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-photos").getPublicUrl(fileName);

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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Le titre est requis");
      return false;
    }

    if (!formData.fruitType) {
      setError("Le type de fruit/légume est requis");
      return false;
    }

    if (!formData.address.trim()) {
      setError("L'adresse est requise");
      return false;
    }

    if (
      !formData.isFree &&
      (!formData.price || parseFloat(formData.price) < 0)
    ) {
      setError("Le prix doit être un nombre positif");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Géocoder l'adresse finale avant soumission
      let finalCoordinates = addressCoordinates;
      if (!finalCoordinates) {
        finalCoordinates = await geocodeAddress(formData.address);
      }

      const listingData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        fruit_type: formData.fruitType,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        is_free: formData.isFree,
        can_pick_from_tree: formData.canPickFromTree,
        can_pick_from_ground: formData.canPickFromGround,
        owner_presence_required: formData.ownerPresenceRequired,
        available_times: formData.availableTimes.trim(),
        address: formData.address.trim(),
        photos: formData.photos,
        latitude: finalCoordinates ? finalCoordinates[0] : null,
        longitude: finalCoordinates ? finalCoordinates[1] : null,
      };

      const { data, error: insertError } = await supabase
        .from("listings_2025_10_29_18_05")
        .insert(listingData)
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/listing/${data.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error.message.includes("address")) {
        setError(
          "Erreur avec l'adresse fournie. Veuillez vérifier et réessayer."
        );
      } else {
        setError("Erreur lors de la création de l'annonce");
      }
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
                    maxLength="100"
                  />
                  <div className="char-count">
                    {formData.title.length}/100 caractères
                  </div>
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
                    placeholder="Décrivez vos fruits/légumes, leur état, quantité disponible, variété..."
                    maxLength="500"
                  />
                  <div className="char-count">
                    {formData.description.length}/500 caractères
                  </div>
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
                    Offre gratuite
                  </label>
                </div>

                {!formData.isFree && (
                  <div className="form-group">
                    <label htmlFor="price">Prix (€) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required={!formData.isFree}
                    />
                    <div className="input-help">
                      Laissez 0 pour une offre gratuite
                    </div>
                  </div>
                )}

                <div className="conditions-grid">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="canPickFromTree"
                        checked={formData.canPickFromTree}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      🌳 Cueillette sur l'arbre
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
                      🍂 Ramassage au sol
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
                      👤 Présence requise
                    </label>
                  </div>
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
                    placeholder="Ex: Lundi-Vendredi 18h-20h, Weekend 9h-18h&#10;Ou: Sur rendez-vous"
                    maxLength="200"
                  />
                  <div className="char-count">
                    {formData.availableTimes.length}/200 caractères
                  </div>
                </div>

                <div className="form-group address-group">
                  <label htmlFor="address">Adresse *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => {
                      handleChange(e);
                      handleAddressSearch(e.target.value);
                    }}
                    onFocus={() =>
                      setShowSuggestions(addressSuggestions.length > 0)
                    }
                    required
                    placeholder="Commencez à taper votre adresse ou nom de commune..."
                  />

                  {showSuggestions && (
                    <div className="address-suggestions">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {addressCoordinates && (
                    <div className="address-confirmed">
                      ✅ Adresse localisée sur la carte
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Photos</h3>
                <div className="photo-upload-info">
                  <p>
                    Ajoutez jusqu'à 5 photos pour présenter vos fruits/légumes
                  </p>
                </div>

                <div className="photo-upload">
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos || formData.photos.length >= 5}
                  />
                  <label htmlFor="photos" className="upload-label">
                    {uploadingPhotos ? (
                      <>
                        <div className="upload-spinner"></div>
                        Téléchargement...
                      </>
                    ) : (
                      `📷 Ajouter des photos (${formData.photos.length}/5)`
                    )}
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
                  disabled={loading}
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
