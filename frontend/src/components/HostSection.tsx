'use client';

import React from 'react';
import './HostSection.css';

const HostSection = () => {
  return (
    <section className="host-section-container">
      <div className="host-card">
        <div className="host-content">
          <h2 className="host-title">Become a Host</h2>
          <p className="host-description">
            Turn your premium vehicle into a high-earning asset. Join our exclusive community of curators and start earning today.
          </p>
          <div className="host-actions">
            <button className="host-btn primary">Start Hosting</button>
            <button className="host-btn secondary">Learn More</button>
          </div>
        </div>
        <div className="host-image">
           <img src="https://images.unsplash.com/photo-1542362567-b05503f3fb15?auto=format&fit=crop&q=80&w=800" alt="Host your car" />
           <div className="host-image-overlay"></div>
        </div>
      </div>
    </section>
  );
};

export default HostSection;
