import React, { useEffect, useState } from 'react';
import Monitoring from './Monitoring.jsx';
import { getPriceData } from '../services/priceService.js';

// Public-facing dashboard entry point. Fetches prices and renders the monitoring/visuals read-only.
export default function PublicDashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPriceData();
        setPrices(data || []);
      } catch (err) {
        console.error('Failed to load prices for public dashboard', err);
        setError('Unable to load data right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: 800 }}>DTI Price Monitoring (Public)</h1>
          <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '14px' }}>
            View prevailing prices, SRP compliance, and price movements by product, size, and region.
          </p>
        </header>

        {loading ? (
          <div style={{ color: '#94a3b8', padding: '40px 0' }}>Loading data…</div>
        ) : error ? (
          <div style={{ color: '#dc2626', padding: '40px 0' }}>{error}</div>
        ) : (
          <Monitoring prices={prices} onSeeAnalysis={() => {}} hideStores />
        )}
      </div>
    </div>
  );
}
