'use client';

import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>('/logo.png');

  return (
    <header className="user-header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" className="logo-link">
            <div className="logo">
              {logo ? (
                <img src={logo} alt="CarRentify" className="site-logo" />
              ) : (
                'CarRentify'
              )}
            </div>
          </a>
          <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
            <a href="/" className="nav-link active">Find Cars</a>
            <a href="/howitworks" className="nav-link">How it works</a>
            <a href="/support" className="nav-link">Support</a>
            {/* Mobile Only links */}
            <div className="mobile-only-links">
               <a href="/host" className="nav-link">Host your car</a>
            </div>
          </nav>
        </div>
        
        <div className="header-right">
          <a href="/host" className="host-link desktop-only">Host your car</a>
          <button className="icon-btn desktop-only">
            <span className="bell-icon">🔔</span>
          </button>
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=SAI&background=17094a&color=fff" alt="User" />
          </div>
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </header>
  );
};

export default Header;
