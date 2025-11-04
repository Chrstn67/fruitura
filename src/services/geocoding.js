// services/geocoding.js

export const searchAddresses = async (query) => {
  if (query.length < 3) {
    return [];
  }

  try {
    // Utiliser l'API correcte sans paramètre type=municipality
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        query
      )}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features.map((feature) => ({
        label: feature.properties.label,
        city: feature.properties.city,
        postcode: feature.properties.postcode,
        context: feature.properties.context,
      }));
    }

    return [];
  } catch (error) {
    console.error("Erreur de recherche d'adresse:", error);
    // Retourner des suggestions par défaut basées sur des villes françaises populaires
    return getFallbackSuggestions(query);
  }
};

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        address
      )}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lat, lon];
    }

    throw new Error("Adresse non trouvée");
  } catch (error) {
    console.error("Erreur de géocodage:", error);
    // Retourner des coordonnées par défaut (Paris) en cas d'erreur
    return [48.8566, 2.3522];
  }
};

// Suggestions de fallback pour éviter les erreurs CORS en développement
const getFallbackSuggestions = (query) => {
  const frenchCities = [
    "Paris, 75000",
    "Marseille, 13000",
    "Lyon, 69000",
    "Toulouse, 31000",
    "Nice, 06000",
    "Nantes, 44000",
    "Strasbourg, 67000",
    "Montpellier, 34000",
    "Bordeaux, 33000",
    "Lille, 59000",
  ];

  const filtered = frenchCities.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map((city) => ({
    label: city,
    city: city.split(",")[0],
    postcode: city.split(",")[1].trim(),
    context: "France",
  }));
};
