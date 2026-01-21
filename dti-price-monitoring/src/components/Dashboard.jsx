import React from "react";
import { ShoppingCart, Package, ListChecks, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard({ prices }) {
  // Analytical Calculations
  const totalEntries = prices.length;
  const uniqueCommodities = new Set(prices.map((p) => p.commodity)).size;
  const uniqueStores = new Set(prices.map((p) => p.store)).size;
  
  // Calculate average price change for a "Trend" feel
  const avgChange = prices.length > 0 
    ? (prices.reduce((acc, curr) => acc + (curr.price - (curr.prevPrice || curr.price)), 0) / prices.length).toFixed(2)
    : 0;

  // --- PREVAILING PRICE CALCULATION ---
  const calculatePrevailing = () => {
    const grouped = prices.reduce((acc, item) => {
      if (!acc[item.commodity]) acc[item.commodity] = [];
      acc[item.commodity].push(item);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map(name => {
        const items = grouped[name];
        const pList = items.map(i => i.price);
        const srp = items[0].srp || 0;
        const freq = {};
        let maxFreq = 0;
        pList.forEach(p => { 
          freq[p] = (freq[p] || 0) + 1; 
          if(freq[p] > maxFreq) maxFreq = freq[p]; 
        });
        const modes = Object.keys(freq).filter(p => freq[p] === maxFreq);

        let prevailing;
        if (maxFreq > 1 && modes.length === 1) {
          prevailing = Number(modes[0]);
        } else {
          const validUnderSRP = pList.filter(p => p <= srp);
          prevailing = validUnderSRP.length > 0 ? Math.max(...validUnderSRP) : Math.max(...pList);
        }
        
        const avgPrice = (pList.reduce((a, b) => a + b, 0) / pList.length).toFixed(2);
        return { commodity: name, prevailing, srp, count: items.length, avgPrice };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  // --- TOP 5 HIGH/LOW PRODUCTS ---
  const getTop5HighLow = () => {
    const sorted = [...prices].sort((a, b) => b.price - a.price);
    return {
      highest: sorted.slice(0, 5),
      lowest: sorted.slice(-5).reverse()
    };
  };

  // --- PRICE TREND BY MUNICIPALITY ---
  const getPriceTrendByMunicipality = () => {
    const grouped = prices.reduce((acc, item) => {
      const key = item.municipality || "Unspecified";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item.price);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([municipality, priceList]) => ({
        municipality,
        avgPrice: (priceList.reduce((a, b) => a + b, 0) / priceList.length).toFixed(2),
        count: priceList.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const prevailingPrices = calculatePrevailing();
  const { highest, lowest } = getTop5HighLow();
  const municipalityTrends = getPriceTrendByMunicipality();

  return (
    <div style={{ marginBottom: "32px", fontFamily: "'Inter', sans-serif" }}>
      {/* QUICK STATS */}
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

      {/* PREVAILING PRICES */}
      <div style={{ ...containerStyle, marginTop: "24px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700", marginBottom: "16px" }}>
          Prevailing Prices for the Month
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {prevailingPrices.length > 0 ? (
            prevailingPrices.map((item, idx) => (
              <div key={idx} style={prevailingCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
                      {item.commodity}
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                      ₱{item.prevailing}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#94a3b8" }}>
                    <div>SRP: ₱{item.srp}</div>
                    <div style={{ marginTop: "4px" }}>{item.count} stores</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1/-1", padding: "20px", textAlign: "center", color: "#94a3b8" }}>
              No data available yet
            </div>
          )}
        </div>

        {/* Prevailing Prices Comparison Chart */}
        {prevailingPrices.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#0f172a", fontWeight: "700" }}>
              Prevailing vs SRP Comparison
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prevailingPrices}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="commodity" 
                  stroke="#64748b"
                  style={{ fontSize: "0.85rem" }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: "0.85rem" }}
                  label={{ value: "Price (₱)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip 
                  formatter={(value) => `₱${value}`}
                  contentStyle={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Legend />
                <Bar dataKey="prevailing" fill="#38bdf8" radius={[8, 8, 0, 0]} name="Prevailing Price" />
                <Bar dataKey="srp" fill="#94a3b8" radius={[8, 8, 0, 0]} name="SRP" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* PRICE TREND VISUALIZATION */}
      <div style={{ ...containerStyle, marginTop: "24px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700", marginBottom: "16px" }}>
          Price Trends by Location
        </h3>
        {municipalityTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={municipalityTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="municipality" 
                stroke="#64748b"
                style={{ fontSize: "0.85rem" }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: "0.85rem" }}
                label={{ value: "Avg Price (₱)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip 
                formatter={(value) => `₱${value}`}
                contentStyle={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#0f172a" 
                strokeWidth={2}
                dot={{ fill: "#38bdf8", r: 5 }}
                activeDot={{ r: 7 }}
                name="Average Price"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            No data available for visualization
          </div>
        )}
      </div>

      {/* TOP 5 PRICE EXTREMES */}
      <div style={{ ...containerStyle, marginTop: "24px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700", marginBottom: "16px" }}>
          Top 5 Price Extremes
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Highest Prices Chart */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#dc2626", fontWeight: "700" }}>
              <ArrowUp size={16} style={{ display: "inline", marginRight: "4px" }} /> Highest Prices
            </h4>
            {highest.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={highest}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="commodity" 
                    stroke="#64748b"
                    style={{ fontSize: "0.75rem" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: "0.85rem" }}
                    label={{ value: "Price (₱)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip 
                    formatter={(value) => `₱${value}`}
                    contentStyle={{ background: "#fee2e2", border: "1px solid #dc2626", borderRadius: "8px" }}
                  />
                  <Bar dataKey="price" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                No data available
              </div>
            )}
          </div>

          {/* Lowest Prices Chart */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#16a34a", fontWeight: "700" }}>
              <ArrowDown size={16} style={{ display: "inline", marginRight: "4px" }} /> Lowest Prices
            </h4>
            {lowest.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={lowest}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="commodity" 
                    stroke="#64748b"
                    style={{ fontSize: "0.75rem" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: "0.85rem" }}
                    label={{ value: "Price (₱)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip 
                    formatter={(value) => `₱${value}`}
                    contentStyle={{ background: "#dcfce7", border: "1px solid #16a34a", borderRadius: "8px" }}
                  />
                  <Bar dataKey="price" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                No data available
              </div>
            )}
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

const prevailingCardStyle = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
};

const extremeItemStyle = (bgColor, borderColor) => ({
  background: bgColor,
  padding: "12px",
  borderRadius: "8px",
  border: `1px solid ${borderColor}20`,
  borderLeft: `3px solid ${borderColor}`
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