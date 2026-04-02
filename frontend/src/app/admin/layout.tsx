import React from 'react';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-avatar" style={{ background: '#17094a' }}>C</div>
          <span>Rentify Admin</span>
        </div>
        
        <nav className="admin-nav">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="admin-nav-item">
              <a href="/admin" className="admin-nav-link active">
                <span>📊</span> Dashboard
              </a>
            </li>
            <li className="admin-nav-item">
              <a href="/admin/bookings" className="admin-nav-link">
                <span>📅</span> Bookings
              </a>
            </li>
            <li className="admin-nav-item">
              <a href="/admin/cars" className="admin-nav-link">
                <span>🚗</span> Car Fleet
              </a>
            </li>
            <li className="admin-nav-item">
              <a href="/admin/users" className="admin-nav-link">
                <span>👥</span> Customers
              </a>
            </li>
            <li className="admin-nav-item">
              <a href="/admin/analytics" className="admin-nav-link">
                <span>📈</span> Analytics
              </a>
            </li>
            <li className="admin-nav-item">
              <a href="/admin/settings" className="admin-nav-link">
                <span>⚙️</span> Settings
              </a>
            </li>
          </ul>
        </nav>

        <div className="admin-footer" style={{ marginTop: 'auto' }}>
          <a href="/" className="admin-nav-link" style={{ color: '#f43f5e' }}>
            <span>🚪</span> Exit Dashboard
          </a>
        </div>
      </aside>

      <main className="admin-content animate-fade-in">
        <header className="admin-header">
          <h1>Welcome Back, Admin</h1>
          <div className="admin-user-profile">
            <span style={{ fontWeight: 600 }}>SAI</span>
            <div className="admin-avatar">S</div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
