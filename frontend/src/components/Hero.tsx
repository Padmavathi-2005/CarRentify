'use client';

import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src="/hero-car-new.png" alt="Luxury Car" className="hero-img" />
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <h1 className="hero-title">
          Drive the <span className="highlight">Future</span> of Elegance.
        </h1>
        <p className="hero-subtitle">
          Velocity Blue curates an elite fleet of vehicles for those who demand performance and prestige in every journey.
        </p>

        <div className="search-bar-container animate-fade-in">
          <div className="search-bar">
            <div className="search-field where">
              <span className="field-label">WHERE</span>
              <div className="field-input">
                <span className="icon">📍</span>
                <input type="text" placeholder="Location" />
              </div>
            </div>

            <div className="search-group">
              <div className="search-subgroup">
                <span className="group-label">FROM</span>
                <div className="group-inputs">
                  <div className="input-with-icon date-box">
                    <span className="icon">📅</span>
                    <input type="date" className="date-input" defaultValue="2024-04-01" />
                  </div>
                  <div className="divider"></div>
                  <div className="input-with-icon time-box">
                    <span className="icon">🕒</span>
                    <input type="time" className="time-input" defaultValue="10:00" />
                  </div>
                </div>
              </div>
 
              <div className="search-subgroup">
                <span className="group-label">UNTIL</span>
                <div className="group-inputs">
                  <div className="input-with-icon date-box">
                    <span className="icon">📅</span>
                    <input type="date" className="date-input" defaultValue="2024-04-02" />
                  </div>
                  <div className="divider"></div>
                  <div className="input-with-icon time-box">
                    <span className="icon">🕒</span>
                    <input type="time" className="time-input" defaultValue="10:00" />
                  </div>
                </div>
              </div>
            </div>

            <button className="search-btn">Search</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
