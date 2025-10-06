import React from "react";
import "../../styles/spyglass.css";

const legendItems = [
  ["#a80000", "Urban"],
  ["#ff0000", "Dense Settlements"],
  ["#0070ff", "Rice Villages"],
  ["#00c5ff", "Irrigated Villages"],
  ["#00ffc5", "Cropped Pastoral Villages"],
  ["#ff73df", "Pastoral Villages"],
  ["#a900e6", "Rainfed Villages"],
  ["#ff00c5", "Rainfed Mosaic Villages"],
  ["#70a800", "Residential Irrigated Cropland"],
  ["#98e600", "Residential Rainfed Mosaic"],
  ["#e6e600", "Popular Irrigated Cropland"],
  ["#d1ff73", "Populated Rainfed Cropland"],
  ["#ffff73", "Remote Cropland"],
  ["#e69800", "Residential Rageland"],
  ["#ffd37f", "Populated Rageland"],
  ["#ffebaf", "Remote Rageland"],
  ["#2ed16f", "Populated Forest"],
  ["#9ed7c2", "Remote Forest"],
  ["#cdffcd", "Wild Forest"],
  ["#ebffeb", "Sparse Trees"],
  ["#e1e1e1", "Barren"],
];

const Legend: React.FC = () => {
  return (
    <div className="legend-container">
      <h4>Biome Legend</h4>
      {legendItems.map(([color, label]) => (
        <div key={label} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: color }}
          ></span>
          <span className="legend-text">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
