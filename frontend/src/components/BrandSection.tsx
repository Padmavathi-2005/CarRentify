'use client';

import React from 'react';
import './BrandSection.css';

const BrandSection = () => {
  const brands = [
    'TESLA', 'BMW', 'PORSCHE', 'MERCEDES', 'AUDI', 'RIVIAN', 
    'LAMBORGHINI', 'FERRARI', 'ROLLS ROYCE', 'BENTLEY', 'ASTON MARTIN', 'MCLAREN'
  ];

  return (
    <section className="brand-section">
      <div className="brand-container">
        <h3 className="brand-subtitle">BROWSE BY BRAND</h3>
        <div className="brand-carousel">
          <div className="brand-track">
            {brands.map((brand) => (
              <div key={brand} className="brand-item">
                {brand}
              </div>
            ))}
            {/* Duplicate for infinite effect */}
            {brands.map((brand) => (
              <div key={`${brand}-dup`} className="brand-item">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
