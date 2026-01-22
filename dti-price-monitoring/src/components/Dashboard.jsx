import React, { useMemo, useState, useRef } from "react";
import { ShoppingCart, Package, ListChecks, TrendingUp, ArrowUp, ArrowDown, Filter, Calendar, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Dashboard({ prices }) {
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [dateRange, setDateRange] = useState("90d");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const pieColors = ["#22c55e", "#f97316"];
  const timelineChartRef = useRef(null);
  const complianceChartRef = useRef(null);
  const srpChartRef = useRef(null);
  const prevailingChartRef = useRef(null);
  const municipalityChartRef = useRef(null);
  const highestChartRef = useRef(null);
  const lowestChartRef = useRef(null);
  const filterLabel = useMemo(() => {
    const parts = [];
    if (selectedCommodity !== "all") parts.push(`Commodity: ${selectedCommodity}`);
    if (selectedStore !== "all") parts.push(`Store: ${selectedStore}`);
    if (selectedMonth !== "all") {
      const monthName = new Date(2000, Number(selectedMonth), 1).toLocaleString("default", { month: "long" });
      parts.push(`Month: ${monthName}`);
    }
    if (selectedYear !== "all") parts.push(`Year: ${selectedYear}`);
    if (selectedMonth === "all" && selectedYear === "all") {
      if (dateRange === "30d") parts.push("Range: Last 30d");
      else if (dateRange === "90d") parts.push("Range: Last 90d");
      else parts.push("Range: All time");
    }
    return parts.length ? parts.join(" • ") : "All data";
  }, [selectedCommodity, selectedStore, selectedMonth, selectedYear, dateRange]);

  const pricesArray = Array.isArray(prices) ? prices : [];

  const uniqueCommodities = useMemo(
    () => [...new Set(pricesArray.map((p) => p.commodity).filter(Boolean))],
    [pricesArray]
  );
  const uniqueStores = useMemo(
    () => [...new Set(pricesArray.map((p) => p.store).filter(Boolean))],
    [pricesArray]
  );

  const { availableMonths, availableYears } = useMemo(() => {
    const monthSet = new Set();
    const yearSet = new Set();
    pricesArray.forEach((p) => {
      if (!p || !p.timestamp) return;
      const d = new Date(p.timestamp);
      if (Number.isNaN(d.getTime())) return;
      monthSet.add(d.getMonth());
      yearSet.add(d.getFullYear());
    });
    return {
      availableMonths: Array.from(monthSet).sort((a, b) => a - b),
      availableYears: Array.from(yearSet).sort((a, b) => b - a)
    };
  }, [pricesArray]);

  const dateThreshold = useMemo(() => {
    if (selectedMonth !== "all" || selectedYear !== "all") return null; // explicit month/year overrides rolling range
    const now = new Date();
    if (dateRange === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (dateRange === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return null; // all time
  }, [dateRange, selectedMonth, selectedYear]);

  const filteredPrices = useMemo(() => {
    return pricesArray.filter((p) => {
      if (!p) return false;
      if (selectedCommodity !== "all" && p.commodity !== selectedCommodity) return false;
      if (selectedStore !== "all" && p.store !== selectedStore) return false;
      const ts = p.timestamp ? new Date(p.timestamp) : null;
      if (selectedYear !== "all") {
        if (!ts || ts.getFullYear() !== Number(selectedYear)) return false;
      }
      if (selectedMonth !== "all") {
        if (!ts || ts.getMonth() !== Number(selectedMonth)) return false;
      }
      if (dateThreshold) {
        if (!ts || ts < dateThreshold) return false;
      }
      return true;
    });
  }, [pricesArray, selectedCommodity, selectedStore, dateThreshold, selectedMonth, selectedYear]);

  const totalEntries = filteredPrices.length;
  const uniqueCommoditiesCount = new Set(filteredPrices.map((p) => p.commodity)).size;
  const uniqueStoresCount = new Set(filteredPrices.map((p) => p.store)).size;
  
  const avgChange = filteredPrices.length > 0 
    ? (filteredPrices.reduce((acc, curr) => acc + (curr.price - (curr.prevPrice || curr.price)), 0) / filteredPrices.length).toFixed(2)
    : 0;

  // --- PREVAILING PRICE CALCULATION ---
  const calculatePrevailing = (source) => {
    const grouped = source.reduce((acc, item) => {
      if (!item || !item.commodity) return acc;
      if (!acc[item.commodity]) acc[item.commodity] = [];
      acc[item.commodity].push(item);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map(name => {
        const items = grouped[name];
        const pList = items.map(i => Number(i.price) || 0).filter((v) => !Number.isNaN(v));
        const srp = items.find(i => Number(i.srp) > 0)?.srp || 0;
        if (pList.length === 0) return null;

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
          const validUnderSRP = srp ? pList.filter(p => p <= srp) : [];
          prevailing = validUnderSRP.length > 0 ? Math.max(...validUnderSRP) : Math.max(...pList);
        }
        
        const avgPrice = (pList.reduce((a, b) => a + b, 0) / pList.length).toFixed(2);
        return { commodity: name, prevailing, srp, count: items.length, avgPrice };
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  // --- TOP 5 HIGH/LOW PRODUCTS ---
  const getTop5HighLow = () => {
    const sorted = [...filteredPrices].sort((a, b) => (b.price || 0) - (a.price || 0));
    return {
      highest: sorted.slice(0, 5),
      lowest: sorted.slice(-5).reverse()
    };
  };

  // --- PRICE TREND BY MUNICIPALITY ---
  const getPriceTrendByMunicipality = () => {
    const grouped = filteredPrices.reduce((acc, item) => {
      const key = item.municipality || "Unspecified";
      if (!acc[key]) acc[key] = [];
      acc[key].push(Number(item.price) || 0);
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

  const prevailingPrices = calculatePrevailing(filteredPrices);
  const { highest, lowest } = getTop5HighLow();
  const municipalityTrends = getPriceTrendByMunicipality();

  const latestPerCommodity = useMemo(() => {
    const map = {};
    filteredPrices.forEach((p) => {
      if (!p || !p.commodity) return;
      const ts = p.timestamp ? new Date(p.timestamp).getTime() : 0;
      const current = map[p.commodity];
      if (!current || ts >= current.ts) {
        map[p.commodity] = {
          commodity: p.commodity,
          price: Number(p.price) || 0,
          srp: Number(p.srp) || 0,
          ts,
          store: p.store || "Unknown"
        };
      }
    });
    return Object.values(map);
  }, [filteredPrices]);

  const complianceBreakdown = useMemo(() => {
    let compliant = 0;
    let nonCompliant = 0;
    latestPerCommodity.forEach((item) => {
      const { price, srp } = item;
      const ok = srp > 0 ? price <= srp : true;
      if (ok) compliant += 1; else nonCompliant += 1;
    });
    return [
      { name: "Compliant", value: compliant },
      { name: "Non-Compliant", value: nonCompliant }
    ];
  }, [latestPerCommodity]);

  const srpVsCurrentData = useMemo(() => {
    return latestPerCommodity.map((item) => ({
      commodity: item.commodity,
      current: item.price,
      srp: item.srp || 0,
    })).slice(0, 10);
  }, [latestPerCommodity]);

  const timeSeriesData = useMemo(() => {
    const buckets = {};
    filteredPrices.forEach((p) => {
      if (!p || !p.timestamp) return;
      const day = new Date(p.timestamp).toISOString().split("T")[0];
      if (!buckets[day]) buckets[day] = { date: day, total: 0, count: 0 };
      buckets[day].total += Number(p.price) || 0;
      buckets[day].count += 1;
    });
    return Object.values(buckets)
      .map((b) => ({ date: b.date, avgPrice: b.count ? b.total / b.count : 0 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredPrices]);

  const topMovers = useMemo(() => {
    const grouped = {};
    filteredPrices.forEach((p) => {
      if (!p || !p.commodity || !p.store) return;
      const key = `${p.commodity}_${p.store}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ price: Number(p.price) || 0, ts: p.timestamp ? new Date(p.timestamp).getTime() : 0 });
    });

    const deltas = Object.entries(grouped).map(([key, arr]) => {
      const sorted = arr.sort((a, b) => b.ts - a.ts);
      const latest = sorted[0]?.price ?? 0;
      const prev = sorted[1]?.price ?? latest;
      return {
        key,
        change: latest - prev,
        latest,
        prev,
      };
    });

    const topUp = [...deltas].sort((a, b) => b.change - a.change).slice(0, 5);
    const topDown = [...deltas].sort((a, b) => a.change - b.change).slice(0, 5);
    return { topUp, topDown };
  }, [filteredPrices]);

  // Download chart as image
  const downloadChart = async (ref, fileName) => {
    if (!ref?.current) return;
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Chart download error:", error);
    }
  };

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
              <div style={statValueStyle}>{uniqueCommoditiesCount}</div>
              <div style={statLabelStyle}>Commodities Monitored</div>
            </div>
          </div>

          {/* Stores Card */}
          <div style={statCardStyle("#ecfdf5", "#059669")}>
            <div style={iconWrapperStyle("#d1fae5")}>
              <ShoppingCart size={24} color="#059669" />
            </div>
            <div>
              <div style={statValueStyle}>{uniqueStoresCount}</div>
              <div style={statLabelStyle}>Active Establishments</div>
            </div>
          </div>

        </div>
      </div>

      {/* FILTERED INSIGHTS */}
      <div style={{ ...containerStyle, marginTop: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700", marginBottom: "16px" }}>
          Filtered Insights
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ minWidth: "200px" }}>
            <div style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>Commodity</div>
            <div style={{ position: "relative" }}>
              <Filter size={16} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All commodities</option>
                {uniqueCommodities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ minWidth: "200px" }}>
            <div style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>Store</div>
            <div style={{ position: "relative" }}>
              <Filter size={16} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All stores</option>
                {uniqueStores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ minWidth: "200px" }}>
            <div style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>Month</div>
            <div style={{ position: "relative" }}>
              <Calendar size={16} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{new Date(2000, m, 1).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ minWidth: "160px" }}>
            <div style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>Year</div>
            <div style={{ position: "relative" }}>
              <Calendar size={16} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ minWidth: "200px" }}>
            <div style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>Date Range</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              {["30d", "90d", "all"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: dateRange === range ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                    background: dateRange === range ? "#e0f2fe" : "#f8fafc",
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Calendar size={16} />
                  {range === "30d" && "Last 30d"}
                  {range === "90d" && "Last 90d"}
                  {range === "all" && "All time"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={filterTagStyle}>Filtered: {filterLabel}</div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Average Price Timeline</div>
              <button onClick={() => downloadChart(timelineChartRef, "PriceTimeline")} style={chartDownloadButtonStyle} title="Download chart">
                <Download size={14} />
              </button>
            </div>
            <div ref={timelineChartRef}>
              {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "0.8rem" }} />
                  <YAxis stroke="#64748b" style={{ fontSize: "0.85rem" }} label={{ value: "Avg Price (₱)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => `₱${value.toFixed ? value.toFixed(2) : value}`} contentStyle={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="avgPrice" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No trend data available</div>
            )}
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Compliance Snapshot</div>
              <button onClick={() => downloadChart(complianceChartRef, "ComplianceSnapshot")} style={chartDownloadButtonStyle} title="Download chart">
                <Download size={14} />
              </button>
            </div>
            <div ref={complianceChartRef}>
              {complianceBreakdown.some((c) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={complianceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {complianceBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} items`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No compliance data yet</div>
            )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginTop: "16px" }}>
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>SRP vs Current (Top 10)</div>
              <button onClick={() => downloadChart(srpChartRef, "SRPvsCurrent")} style={chartDownloadButtonStyle} title="Download chart">
                <Download size={14} />
              </button>
            </div>
            <div ref={srpChartRef}>
              {srpVsCurrentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={srpVsCurrentData} margin={{ bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="commodity" stroke="#64748b" style={{ fontSize: "0.75rem" }} angle={-35} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" style={{ fontSize: "0.85rem" }} label={{ value: "Price (₱)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => `₱${value}`} />
                  <Legend />
                  <Bar dataKey="current" name="Current" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="srp" name="SRP" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No SRP comparison data</div>
            )}
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Top Movers</div>
            {topMovers.topUp.length === 0 && topMovers.topDown.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>No change detected</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <div style={{ color: "#16a34a", fontWeight: 700, marginBottom: "6px" }}>Largest Upticks</div>
                  {topMovers.topUp.map((item) => (
                    <div key={item.key} style={{ ...extremeItemStyle("#ecfdf3", "#16a34a"), marginBottom: "6px" }}>
                      <div style={{ fontWeight: 700, color: "#065f46" }}>{item.key.replace("_", " • ")}</div>
                      <div style={{ color: "#16a34a", fontWeight: 700 }}>+₱{item.change.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: "#dc2626", fontWeight: 700, marginBottom: "6px" }}>Largest Drops</div>
                  {topMovers.topDown.map((item) => (
                    <div key={item.key} style={{ ...extremeItemStyle("#fef2f2", "#dc2626"), marginBottom: "6px" }}>
                      <div style={{ fontWeight: 700, color: "#7f1d1d" }}>{item.key.replace("_", " • ")}</div>
                      <div style={{ color: "#dc2626", fontWeight: 700 }}>₱{item.change.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREVAILING PRICES */}
      <div style={{ ...containerStyle, marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700" }}>
              Prevailing Prices for the Month
            </h3>
          </div>
          <button onClick={() => downloadChart(prevailingChartRef, "PrevailingPrices")} style={chartDownloadButtonStyle} title="Download chart">
            <Download size={14} />
          </button>
        </div>
        <div style={filterTagStyle}>Filtered: {filterLabel}</div>
        <div ref={prevailingChartRef}>
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
            <div style={{ position: "relative" }}>
              <button onClick={() => downloadChart(prevailingChartRef, "PrevailingComparison")} style={{ ...chartDownloadButtonStyle, position: "absolute", top: "-40px", right: "0", zIndex: 10 }} title="Download chart">
                <Download size={14} />
              </button>
            </div>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700" }}>
              Price Trends by Location
            </h3>
          </div>
          <button onClick={() => downloadChart(municipalityChartRef, "PriceTrends")} style={chartDownloadButtonStyle} title="Download chart">
            <Download size={14} />
          </button>
        </div>
        <div style={filterTagStyle}>Filtered: {filterLabel}</div>
        <div ref={municipalityChartRef}>
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
      </div>

      {/* TOP 5 PRICE EXTREMES */}
      <div style={{ ...containerStyle, marginTop: "24px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "700", marginBottom: "16px" }}>
          Top 5 Price Extremes
        </h3>
        <div style={filterTagStyle}>Filtered: {filterLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Highest Prices Chart */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#dc2626", fontWeight: "700" }}>
                <ArrowUp size={16} style={{ display: "inline", marginRight: "4px" }} /> Highest Prices
              </h4>
              <button onClick={() => downloadChart(highestChartRef, "HighestPrices")} style={chartDownloadButtonStyle} title="Download chart">
                <Download size={14} />
              </button>
            </div>
            <div ref={highestChartRef}>
            </div>
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
          </div>

          {/* Lowest Prices Chart */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#16a34a", fontWeight: "700" }}>
                <ArrowDown size={16} style={{ display: "inline", marginRight: "4px" }} /> Lowest Prices
              </h4>
              <button onClick={() => downloadChart(lowestChartRef, "LowestPrices")} style={chartDownloadButtonStyle} title="Download chart">
                <Download size={14} />
              </button>
            </div>
            <div ref={lowestChartRef}>
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

const filterTagStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#e0f2fe",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "0.85rem",
  margin: "4px 0 12px 0"
};

const chartDownloadButtonStyle = {
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  transition: "all 0.2s ease"
};