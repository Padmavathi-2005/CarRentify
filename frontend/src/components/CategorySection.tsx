'use client';

import React from 'react';
import './CategorySection.css';

const CategorySection = () => {
  const categories = [
    { name: 'SUVs', subtitle: 'Versatile & Rugged', count: 42, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Electric', subtitle: 'Silent Performance', count: 18, img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400' },
    { name: 'Convertibles', subtitle: 'Open Air Freedom', count: 34, img: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=400' },
    { name: 'Luxury', subtitle: 'Prestige & Comfort', count: 124, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400' },
    { name: 'Performance', subtitle: 'Track level speed', count: 36, img: 'https://images.unsplash.com/photo-1567818735868-e71b99932e29?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <section className="category-section">
      <div className="category-container">
        <div className="category-header">
           <div className="title-area">
             <h2 className="category-title">Browse by Type</h2>
             <p className="category-subtitle">The perfect category for every chapter of your journey.</p>
           </div>
           <a href="/categories" className="view-all">View all categories →</a>
        </div>

        <div className="category-grid">
           {categories.map((cat) => (
             <div key={cat.name} className="category-card animate-fade-in">
               <img src={cat.img} alt={cat.name} className="category-img" />
               <div className="category-overlay">
                 <div className="category-info">
                   <h3 className="cat-name">{cat.name}</h3>
                   <p className="cat-sub">{cat.subtitle}</p>
                   <span className="cat-count">{cat.count} CARS</span>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
