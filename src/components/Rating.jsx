import React, { useState } from "react";
import "../styles/Rating.css";

const Rating = ({ value = 0, onChange, readonly = false, size = "medium" }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  return (
    <div className={`rating ${size} ${readonly ? "readonly" : "interactive"}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${
            star <= (hoverValue || value) ? "filled" : "empty"
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
        >
          ⭐
        </button>
      ))}
    </div>
  );
};

export default Rating;
