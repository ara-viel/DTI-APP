import React from "react";
// Note: You can install 'lucide-react' for icons: npm install lucide-react
import { ShoppingCart, Package, ListChecks, TrendingUp } from "lucide-react";

export default function Dashboard({ prices }) {
  // Analytical Calculations
  const totalEntries = prices.length;
  const uniqueCommodities = new Set(prices.map((p) => p.commodity)).size;
  const uniqueStores = new Set(prices.map((p) => p.store)).size;
  
  // Calculate average price change for a "Trend" feel
  const avgChange = prices.length > 0 
    ? (prices.reduce((acc, curr) => acc + (curr.price - (curr.prevPrice || curr.price)), 0) / prices.length).toFixed(2)
    : 0;

  return (
    <div style={{ marginBottom: "32px", fontFamily: "'Inter', sans-serif" }}>
      <div style={containerStyle}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a", fontWeight: "700" }}>
            Market Situationer Overview
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Summary of price and supply monitoring activities for the current period.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          
          {/* Total Entries Card */}
          <div style={statCardStyle("#eff6ff", "#2563eb")}>
            <div style={iconWrapperStyle("#dbeafe")}>
              <ListChecks size={24} color="#2563eb" />
            </div>
            <div>
              <div style={statValueStyle}>{totalEntries}</div>
              <div style={statLabelStyle}>Total Records</div>
            </div>
          </div>

          {/* Commodities Card */}
          <div style={statCardStyle("#faf5ff", "#9333ea")}>
            <div style={iconWrapperStyle("#f3e8ff")}>
              <Package size={24} color="#9333ea" />
            </div>
            <div>
              <div style={statValueStyle}>{uniqueCommodities}</div>
              <div style={statLabelStyle}>Commodities Monitored</div>
            </div>
          </div>

          {/* Stores Card */}
          <div style={statCardStyle("#ecfdf5", "#059669")}>
            <div style={iconWrapperStyle("#d1fae5")}>
              <ShoppingCart size={24} color="#059669" />
            </div>
            <div>
              <div style={statValueStyle}>{uniqueStores}</div>
              <div style={statLabelStyle}>Active Establishments</div>
            </div>
          </div>

          {/* Market Sentiment Card */}
          <div style={statCardStyle("#fff7ed", "#ea580c")}>
            <div style={iconWrapperStyle("#ffedd5")}>
              <TrendingUp size={24} color="#ea580c" />
            </div>
            <div>
              <div style={statValueStyle}>₱{avgChange}</div>
              <div style={statLabelStyle}>Avg. Price Shift</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- STYLES ---

const containerStyle = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const statCardStyle = (bgColor, borderColor) => ({
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  border: `1px solid #f1f5f9`,
  borderLeft: `6px solid ${borderColor}`,
  display: "flex",
  alignItems: "center",
  gap: "16px",
  transition: "transform 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
});

const iconWrapperStyle = (bgColor) => ({
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  backgroundColor: bgColor,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

const statValueStyle = {
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "#1e293b",
  lineHeight: "1.2"
};

const statLabelStyle = {
  fontSize: "0.85rem",
  fontWeight: "500",
  color: "#64748b",
  marginTop: "2px"
};