'use client';

import React from 'react';
import './RecentListings.css';

const RecentListings = () => {
  const recentItems = [
    { name: 'Audi RS e-tron GT', price: 180, type: 'Electric', img: 'https://images.unsplash.com/photo-1614200024991-aa02d8479354?auto=format&fit=crop&q=80&w=400' },
    { name: 'Mercedes G-Class', price: 320, type: 'Luxury', img: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=400' },
    { name: 'Rivian R1S', price: 195, type: 'Electric', img: 'https://images.unsplash.com/photo-1651515250325-2c8c49cc8c42?auto=format&fit=crop&q=80&w=400' },
    { name: 'Lamborghini Huracan', price: 850, type: 'Performance', img: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=400' },
    { name: 'Range Rover Sport', price: 230, type: 'Luxury', img: 'https://images.unsplash.com/photo-1606148632339-99ee17400aa0?auto=format&fit=crop&q=80&w=400' },
    { name: 'Tesla Model X', price: 210, type: 'Electric', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400' },
    { name: 'Ferrari Roma', price: 950, type: 'Performance', img: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <section className="recent-section">
      <div className="recent-container">
        <div className="recent-header">
           <h2 className="recent-title">Recent Listings</h2>
           <p className="recent-subtitle">Newly added premium vehicles joining our fleet.</p>
        </div>

        <div className="recent-grid">
           {recentItems.map((item, idx) => (
             <div key={idx} className="recent-card">
               <div className="recent-img-box">
                 <img src={item.img} alt={item.name} className="recent-img" />
               </div>
               <div className="recent-info">
                 <h3 className="recent-name">{item.name}</h3>
                 <div className="recent-footer">
                    <span className="recent-price">${item.price}<small>/hr</small></span>
                    <span className="recent-badge">{item.type}</span>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default RecentListings;
