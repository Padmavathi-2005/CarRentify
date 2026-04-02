'use client';

import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would be a real API call to the backend we just set up
    setStats({
      totalCars: 48,
      activeUsers: 124,
      totalBookings: 89,
      revenue: '$12,450',
    });
  }, []);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Cars in Fleet</span>
          <div className="admin-stat-value">{stats?.totalCars || '...'}</div>
          <div className="admin-stat-change change-up">
            ↑ 12% vs last month
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderColor: '#10b981' }}>
          <span className="admin-stat-label">Active Customers</span>
          <div className="admin-stat-value">{stats?.activeUsers || '...'}</div>
          <div className="admin-stat-change change-up">
            ↑ 8.4% vs last month
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderColor: '#0ea5e9' }}>
          <span className="admin-stat-label">System Bookings</span>
          <div className="admin-stat-value">{stats?.totalBookings || '...'}</div>
          <div className="admin-stat-change change-down" style={{ color: '#f43f5e' }}>
            ↓ 3.1% vs last month
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderColor: '#8b5cf6' }}>
          <span className="admin-stat-label">Monthly Revenue</span>
          <div className="admin-stat-value">{stats?.revenue || '...'}</div>
          <div className="admin-stat-change change-up">
            ↑ 24% vs last month
          </div>
        </div>
      </div>

      <div className="admin-main-grid">
        <section className="admin-recent-activity">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Recent Fleet Activity</h3>
            <button className="admin-btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              View All Logs
            </button>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🚗</div>
            <div className="activity-info">
              <h4>Tesla Model 3 Booked</h4>
              <p>User #4502 booked for 3 days • 2 hours ago</p>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>🔧</div>
            <div className="activity-info">
              <h4>Maintenance Needed</h4>
              <p>BMW X5 reported low tire pressure • 5 hours ago</p>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>🧤</div>
            <div className="activity-info">
              <h4>Car Return Inspection</h4>
              <p>Audi A6 returned by User #1209 • Yesterday</p>
            </div>
          </div>
        </section>

        <section className="admin-recent-activity">
           <h3 style={{ fontSize: '1.4rem', marginBottom: '30px' }}>Quick Actions</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <button className="admin-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
               ➕ Add New Vehicle
             </button>
             <button className="admin-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
               🗓️ Schedule Maintenance
             </button>
             <button className="admin-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
               📢 Send User Notification
             </button>
             <button className="admin-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
               📄 Generate Report
             </button>
           </div>
        </section>
      </div>
    </div>
  );
}
