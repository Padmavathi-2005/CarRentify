'use client';

import React from 'react';
import './FeaturedListings.css';

const FeaturedListings = () => {
  const listings = [
    { name: 'Tesla Model S Plaid', price: 150, rating: 4.3, reviews: 120, type: 'Electric', seats: 5, img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600' },
    { name: 'Porsche 911 Carrera', price: 295, rating: 5.0, reviews: 840, type: 'Gasoline', seats: 2, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600' },
    { name: 'Land Rover Defender', price: 210, rating: 4.2, reviews: 7520, type: 'AWD', seats: 7, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' },
    { name: 'BMW M4 Competition', price: 245, rating: 4.6, reviews: 63, type: 'Track', seats: 4, img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600' }
  ];

  return (
    <section className="listings-section">
      <div className="listings-container">
        <div className="listings-header">
           <div className="title-area">
             <h2 className="listings-title">Featured Listings</h2>
             <p className="listings-subtitle">Top-rated vehicles available for your next booking.</p>
           </div>
           <div className="listings-controls">
             <button className="control-btn">‹</button>
             <button className="control-btn">›</button>
           </div>
        </div>

        <div className="listings-grid">
           {listings.map((item, idx) => (
             <div key={idx} className="listing-card">
               <div className="listing-img-container">
                 <img src={item.img} alt={item.name} className="listing-img" />
                 <button className="favorite-btn">❤</button>
               </div>
               <div className="listing-info">
                 <div className="listing-main">
                    <h3 className="listing-name">{item.name}</h3>
                    <div className="listing-price">
                       <span className="price-val">${item.price}</span>
                       <span className="price-unit">/ day</span>
                    </div>
                 </div>
                 <div className="listing-rating">
                   <span className="star">⭐</span>
                   <span className="rating-val">{item.rating}</span>
                   <span className="reviews">({item.reviews})</span>
                 </div>
                 <div className="listing-details">
                    <div className="detail-item">
                       <span className="detail-icon">⚡</span>
                       <span>{item.type}</span>
                    </div>
                    <div className="detail-item">
                       <span className="detail-icon">👤</span>
                       <span>{item.seats} Seats</span>
                    </div>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
