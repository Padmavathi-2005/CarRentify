'use client';

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-container">
            <img src="/logo.png" alt="CarRentify" className="footer-site-logo" />
          </div>
          <p className="footer-tagline">
             Redefining the rental experience through innovative design and premium mobility.
          </p>
          <div className="social-links">
             <span>🌐</span>
             <span>🐦</span>
             <span>📸</span>
          </div>
        </div>

        <div className="footer-links">
           <div className="link-group">
              <h4>COMPANY</h4>
              <a href="#">Safety & Trust</a>
              <a href="#">Community Guidelines</a>
              <a href="#">Host Protection</a>
           </div>
           <div className="link-group">
              <h4>RESOURCES</h4>
              <a href="#">Insurance Options</a>
              <a href="#">Support Center</a>
              <a href="#">Terms of Service</a>
           </div>
           <div className="link-group">
              <h4>CONTACT</h4>
              <p>123 Luxury Road, Curator Square, GA 30210</p>
              <a href="mailto:hello@carrentify.com" className="email-link">hello@carrentify.com</a>
           </div>
        </div>
      </div>
      <div className="footer-bottom">
         <p>© 2026 CarRentify Car Rentals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
