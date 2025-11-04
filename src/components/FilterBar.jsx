import React, { useState } from "react";
import "../styles/FilterBar.css";

const FilterBar = ({ onFiltersChange, filters = {} }) => {
  const [localFilters, setLocalFilters] = useState({
    fruitType: filters.fruitType || "",
    priceType: filters.priceType || "",
    maxDistance: filters.maxDistance || "",
    minRating: filters.minRating || "",
    availableDate: filters.availableDate || "",
    ...filters,
  });

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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      fruitType: "",
      priceType: "",
      maxDistance: "",
      minRating: "",
      availableDate: "",
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="filter-bar">
      <div className="container">
        <div className="filter-content">
          <h3>Filtrer les annonces</h3>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Type de fruit/légume</label>
              <select
                value={localFilters.fruitType}
                onChange={(e) =>
                  handleFilterChange("fruitType", e.target.value)
                }
              >
                <option value="">Tous les types</option>
                {fruitTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Prix</label>
              <select
                value={localFilters.priceType}
                onChange={(e) =>
                  handleFilterChange("priceType", e.target.value)
                }
              >
                <option value="">Tous les prix</option>
                <option value="free">Gratuit</option>
                <option value="paid">Payant</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Distance maximale (km)</label>
              <select
                value={localFilters.maxDistance}
                onChange={(e) =>
                  handleFilterChange("maxDistance", e.target.value)
                }
              >
                <option value="">Toutes distances</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Note minimum</label>
              <select
                value={localFilters.minRating}
                onChange={(e) =>
                  handleFilterChange("minRating", e.target.value)
                }
              >
                <option value="">Toutes les notes</option>
                <option value="4">4 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="2">2 étoiles et plus</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Disponible à partir du</label>
              <input
                type="date"
                value={localFilters.availableDate}
                onChange={(e) =>
                  handleFilterChange("availableDate", e.target.value)
                }
              />
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn btn-outline btn-sm">
                Effacer les filtres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
