import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { MapPin } from "lucide-react";

export default function PriceTrendVisualization({ prices }) {
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");

  // Get unique commodities and municipalities
  const uniqueCommodities = [...new Set(prices.map(p => p.commodity))];
  const uniqueMunicipalities = [...new Set(prices.map(p => p.municipality).filter(Boolean))];

  // Auto-select first commodity if none selected
  React.useEffect(() => {
    if (!selectedCommodity && uniqueCommodities.length > 0) {
      setSelectedCommodity(uniqueCommodities[0]);
    }
  }, [uniqueCommodities]);

  // Prepare trend data for the selected commodity
  const getTrendData = () => {
    if (!selectedCommodity) return [];

    // Filter by commodity and municipality
    let filtered = prices.filter(p => p.commodity === selectedCommodity);
    if (selectedMunicipality !== "all") {
      filtered = filtered.filter(p => p.municipality === selectedMunicipality);
    }

    // Group by municipality and store
    const grouped = {};
    
    filtered.forEach(item => {
      const municipality = item.municipality || "Unknown";
      const store = item.store || "Unknown";
      const key = `${municipality}_${store}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          municipality,
          store,
          label: `${store} (${municipality})`,
          prices: []
        };
      }
      
      grouped[key].prices.push({
        price: item.price,
        timestamp: new Date(item.timestamp),
        dateStr: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    });

    // Convert to chart format
    const allDates = new Set();
    Object.values(grouped).forEach(group => {
      group.prices.forEach(p => allDates.add(p.dateStr));
    });

    const sortedDates = Array.from(allDates).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    // Create data points for each date
    const chartData = sortedDates.map(date => {
      const point = { date };
      
      Object.entries(grouped).forEach(([key, group]) => {
        const priceAtDate = group.prices.find(p => p.dateStr === date);
        if (priceAtDate) {
          point[group.label] = priceAtDate.price;
        }
      });
      
      return point;
    });

    return { chartData, stores: Object.values(grouped).map(g => g.label) };
  };

  const { chartData, stores } = getTrendData();

  // Calculate prevailing price statistics
  const getPrevailingPrice = () => {
    if (!selectedCommodity) return null;

    let filtered = prices.filter(p => p.commodity === selectedCommodity);
    if (selectedMunicipality !== "all") {
      filtered = filtered.filter(p => p.municipality === selectedMunicipality);
    }

    if (filtered.length === 0) return null;

    const priceList = filtered.map(p => p.price);
    const avgPrice = priceList.reduce((a, b) => a + b, 0) / priceList.length;
    const minPrice = Math.min(...priceList);
    const maxPrice = Math.max(...priceList);
    
    // Calculate mode (prevailing price)
    const freq = {};
    priceList.forEach(p => {
      freq[p] = (freq[p] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(p => freq[p] === maxFreq);
    const prevailingPrice = modes.length === 1 ? Number(modes[0]) : avgPrice;

    return { avgPrice, minPrice, maxPrice, prevailingPrice };
  };

  const stats = getPrevailingPrice();

  // Color palette for different stores
  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Filters */}
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
              Price Trend Visualization by Municipality/City
            </h3>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              Track prevailing price movements across different locations
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select 
              value={selectedCommodity} 
              onChange={(e) => setSelectedCommodity(e.target.value)}
              style={selectStyle}
            >
              {uniqueCommodities.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
            
            <select 
              value={selectedMunicipality} 
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Municipalities</option>
              {uniqueMunicipalities.map(municipality => (
                <option key={municipality} value={municipality}>{municipality}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Statistics */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>PREVAILING PRICE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#2563eb", marginTop: "4px" }}>
                ₱{stats.prevailingPrice.toFixed(2)}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>AVERAGE PRICE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#475569", marginTop: "4px" }}>
                ₱{stats.avgPrice.toFixed(2)}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>LOWEST PRICE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#22c55e", marginTop: "4px" }}>
                ₱{stats.minPrice.toFixed(2)}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>HIGHEST PRICE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444", marginTop: "4px" }}>
                ₱{stats.maxPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Line Chart */}
        {chartData.length > 0 ? (
          <div style={{ marginTop: "20px" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  label={{ value: 'Price (₱)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Price']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {stores.map((store, index) => (
                  <Line
                    key={store}
                    type="monotone"
                    dataKey={store}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <MapPin size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "1rem" }}>No trend data available for the selected filters</p>
            <p style={{ margin: "8px 0 0 0", fontSize: "0.85rem" }}>Try selecting a different commodity or municipality</p>
          </div>
        )}
      </div>

      {/* Location-based Price Comparison */}
      {selectedMunicipality === "all" && uniqueMunicipalities.length > 0 && (
        <div style={{ ...containerStyle, marginTop: "24px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "#0f172a" }}>
            Price Comparison by Municipality/City
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {uniqueMunicipalities.map(municipality => {
              const municipalityPrices = prices.filter(p => 
                p.commodity === selectedCommodity && p.municipality === municipality
              );
              
              if (municipalityPrices.length === 0) return null;
              
              const avgPrice = municipalityPrices.reduce((sum, p) => sum + p.price, 0) / municipalityPrices.length;
              
              return (
                <div key={municipality} style={locationCardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <MapPin size={16} color="#6366f1" />
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>
                      {municipality}
                    </span>
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1e293b" }}>
                    ₱{avgPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                    {municipalityPrices.length} store{municipalityPrices.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---

const containerStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e2e8f0"
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "0.9rem",
  outline: "none",
  cursor: "pointer",
  background: "white",
  fontWeight: "500"
};

const statCardStyle = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0"
};

const locationCardStyle = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  transition: "all 0.2s",
  cursor: "pointer"
};
