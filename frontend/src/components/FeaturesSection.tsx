'use client';

import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-collage">
          <div className="collage-grid">
            <div className="collage-column col-1">
              <div className="collage-item gear">
                <img src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600" alt="Car Detail" />
              </div>
              <div className="collage-item wheel">
                <img src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600" alt="Wheel" />
              </div>
            </div>
            <div className="collage-column col-2">
              <div className="collage-item headlight">
                <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600" alt="Headlight" />
              </div>
              <div className="collage-item key">
                <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600" alt="Car Key" />
              </div>
            </div>
          </div>
        </div>

        <div className="features-content">
          <h2 className="features-title">Why Rent With Us</h2>
          
          <div className="feature-item">
             <div className="feature-icon-box blue">🛡️</div>
             <div className="feature-text">
               <h3>Curated Reliability</h3>
               <p>Every vehicle in our fleet undergoes a rigorous 150-point inspection before every single booking.</p>
             </div>
          </div>

          <div className="feature-item">
             <div className="feature-icon-box gray">🚚</div>
             <div className="feature-text">
               <h3>White-Glove Delivery</h3>
               <p>We bring the car to your doorstep, airport terminal, or hotel at the exact time you need it.</p>
             </div>
          </div>

          <div className="feature-item">
             <div className="feature-icon-box red">☎️</div>
             <div className="feature-text">
               <h3>24/7 Roadside VIP</h3>
               <p>Dedicated concierge support for anything from navigation help to immediate roadside assistance.</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
