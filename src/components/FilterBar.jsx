import React, { useState, useEffect } from "react";
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

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [fruitSearchTerm, setFruitSearchTerm] = useState("");

  // Gérer le scroll du body quand un dropdown est ouvert
  useEffect(() => {
    if (activeDropdown) {
      // Empêcher le scroll du body
      document.body.classList.add("dropdown-open");
      // Sauvegarder la position de scroll
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restaurer le scroll du body
      document.body.classList.remove("dropdown-open");
      const scrollY = parseInt(document.body.style.top || "0");
      document.body.style.top = "";
      window.scrollTo(0, -scrollY);
    }

    return () => {
      document.body.classList.remove("dropdown-open");
      document.body.style.top = "";
    };
  }, [activeDropdown]);

  // Données pour les dropdowns
  const fruitTypes = [
    "Abricot",
    "Ail",
    "Amande",
    "Ananas",
    "Anone",
    "Artichaut",
    "Asperge",
    "Aubergine",
    "Avocat",
    "Banane",
    "Basilic",
    "Betterave",
    "Blette",
    "Brocoli",
    "Cacao",
    "Cacahuète",
    "Cactus",
    "Câpre",
    "Carambole",
    "Carotte",
    "Cassis",
    "Céleri",
    "Cerfeuil",
    "Cerise",
    "Châtaigne",
    "Chayotte",
    "Chicorée",
    "Chou",
    "Chou-fleur",
    "Chou kale",
    "Chou-rave",
    "Citron",
    "Citron vert",
    "Citrouille",
    "Clémentine",
    "Coing",
    "Concombre",
    "Coriandre",
    "Cornichon",
    "Courge",
    "Courgette",
    "Cresson",
    "Datte",
    "Échalote",
    "Endive",
    "Épinard",
    "Fenouil",
    "Fève",
    "Figue",
    "Fraise",
    "Framboise",
    "Fruit de la passion",
    "Gingembre",
    "Girofle",
    "Goyave",
    "Grenade",
    "Groseille",
    "Haricot",
    "Haricot vert",
    "Houx",
    "Igname",
    "Jacquier",
    "Jujube",
    "Kaki",
    "Kiwi",
    "Kumquat",
    "Laitue",
    "Lentille",
    "Litchi",
    "Macadamia",
    "Mandarine",
    "Mangue",
    "Mangoustan",
    "Marron",
    "Melon",
    "Menthe",
    "Mirabelle",
    "Mûre",
    "Myrtille",
    "Navet",
    "Noisette",
    "Noix",
    "Noix de cajou",
    "Noix de coco",
    "Noix de pécan",
    "Okra",
    "Oignon",
    "Olive",
    "Orange",
    "Pamplemousse",
    "Papaye",
    "Patate douce",
    "Pastèque",
    "Pêche",
    "Persil",
    "Petit pois",
    "Piment",
    "Pistache",
    "Pitaya",
    "Plantain",
    "Poire",
    "Poireau",
    "Pois chiche",
    "Poivron",
    "Pomme",
    "Pomme de terre",
    "Potimarron",
    "Potiron",
    "Prune",
    "Quetsche",
    "Radis",
    "Raisin",
    "Ramboutan",
    "Rhubarbe",
    "Roquette",
    "Rutabaga",
    "Safran",
    "Salade",
    "Salsifis",
    "Sarrasin",
    "Sauge",
    "Shiitake",
    "Soja",
    "Tamarin",
    "Thym",
    "Tomate",
    "Topinambour",
    "Truffe",
    "Vanille",
    "Verveine",
    "Wasabi",
    "Yuzu",
    "Zucchini",
    "Autres",
  ];

  const priceOptions = [
    { value: "", label: "Tous les prix" },
    { value: "free", label: "🆓 Gratuit" },
    { value: "paid", label: "💰 Payant" },
  ];

  const distanceOptions = [
    { value: "", label: "Toutes distances" },
    { value: "5", label: "📏 5 km" },
    { value: "10", label: "📏 10 km" },
    { value: "20", label: "📏 20 km" },
    { value: "50", label: "📏 50 km" },
  ];

  const ratingOptions = [
    { value: "", label: "Toutes les notes" },
    { value: "4", label: "⭐⭐⭐⭐ 4★ et plus" },
    { value: "3", label: "⭐⭐⭐ 3★ et plus" },
    { value: "2", label: "⭐⭐ 2★ et plus" },
  ];

  const filteredFruits = fruitTypes.filter((fruit) =>
    fruit.toLowerCase().includes(fruitSearchTerm.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDropdownSelect = (key, value) => {
    handleFilterChange(key, value);
    setActiveDropdown(null);
    if (key === "fruitType") {
      setFruitSearchTerm("");
    }
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
    setFruitSearchTerm("");
    setActiveDropdown(null);
  };

  const getSelectedLabel = (key, options) => {
    const value = localFilters[key];
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : "";
  };

  const renderDropdown = (key, options, title, isSearchable = false) => {
    const isOpen = activeDropdown === key;
    const selectedLabel = getSelectedLabel(key, options);

    return (
      <div
        className={`filter-group custom-dropdown ${
          isSearchable ? "fruit-dropdown-filter" : ""
        }`}
      >
        <label>{title}</label>
        <div
          className={`dropdown-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setActiveDropdown(isOpen ? null : key)}
        >
          {selectedLabel ? (
            <span className="selected-value">{selectedLabel}</span>
          ) : (
            <span className="placeholder">Sélectionner...</span>
          )}
          <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>

        {isOpen && (
          <>
            <div
              className="dropdown-menu"
              onClick={() => {
                setActiveDropdown(null);
                if (key === "fruitType") setFruitSearchTerm("");
              }}
            >
              <div className="dropdown-header">
                <div className="dropdown-title">{title}</div>
                <button
                  type="button"
                  className="close-dropdown"
                  onClick={() => {
                    setActiveDropdown(null);
                    if (key === "fruitType") setFruitSearchTerm("");
                  }}
                >
                  ✕
                </button>
              </div>

              {isSearchable && (
                <div className="dropdown-search">
                  <input
                    type="text"
                    placeholder={`Rechercher ${title.toLowerCase()}...`}
                    value={fruitSearchTerm}
                    onChange={(e) => setFruitSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              )}

              <div className="dropdown-content">
                <div className="dropdown-list">
                  {isSearchable ? (
                    filteredFruits.length > 0 ? (
                      filteredFruits.map((item) => (
                        <div
                          key={item}
                          className={`dropdown-item ${
                            localFilters[key] === item ? "selected" : ""
                          }`}
                          onClick={() => handleDropdownSelect(key, item)}
                        >
                          <span className="item-name">{item}</span>
                          {localFilters[key] === item && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <div className="no-results-text">
                          Aucun résultat trouvé
                        </div>
                      </div>
                    )
                  ) : (
                    options.map((option) => (
                      <div
                        key={option.value}
                        className={`dropdown-item ${
                          localFilters[key] === option.value ? "selected" : ""
                        }`}
                        onClick={() => handleDropdownSelect(key, option.value)}
                      >
                        <span className="item-name">{option.label}</span>
                        {localFilters[key] === option.value && (
                          <span className="checkmark">✓</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="filter-bar">
      <div className="container">
        <div className="filter-content">
          <h3>Filtrer les annonces</h3>

          <div className="filters-container">
            <div className="filters-row">
              {/* Dropdown Fruits */}
              {renderDropdown("fruitType", [], "Type de produit", true)}

              {/* Dropdown Prix */}
              {renderDropdown("priceType", priceOptions, "Prix")}

              {/* Dropdown Distance */}
              {renderDropdown("maxDistance", distanceOptions, "Distance max")}

              {/* Dropdown Note */}
              {renderDropdown("minRating", ratingOptions, "Note minimum")}

              {/* Champ Date */}
              <div className="filter-group">
                <label>Disponible le</label>
                <input
                  type="date"
                  className="date-input"
                  value={localFilters.availableDate}
                  onChange={(e) =>
                    handleFilterChange("availableDate", e.target.value)
                  }
                />
              </div>

              {/* Bouton Effacer */}
              <div className="filter-actions">
                <button onClick={clearFilters} className="btn">
                  Effacer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
