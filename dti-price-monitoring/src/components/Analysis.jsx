import React from "react";

export default function Analysis({ prevailingReport }) {
  // Logic to count status for the Insight Cards
  const aboveSRPCount = prevailingReport.filter(r => r.prevailing > r.srp).length;
  const compliantCount = prevailingReport.length - aboveSRPCount;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", marginTop: "30px" }}>
      {/* 1. Insight Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Total Monitored</span>
          <div style={valueStyle}>{prevailingReport.length}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: "4px solid #ef4444" }}>
          <span style={labelStyle}>Above SRP</span>
          <div style={{ ...valueStyle, color: "#ef4444" }}>{aboveSRPCount}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: "4px solid #22c55e" }}>
          <span style={labelStyle}>Compliant</span>
          <div style={{ ...valueStyle, color: "#22c55e" }}>{compliantCount}</div>
        </div>
      </div>

      {/* 2. The Main Report Table */}
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>Generated Prevailing Price Report</h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: "4px" }}>
            Monthly Summary
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={thStyle}>COMMODITY</th>
              <th style={thStyle}>PREVAILING PRICE</th>
              <th style={thStyle}>SRP LIMIT</th>
              <th style={thStyle}>VARIANCE</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {prevailingReport.map((r, index) => {
              const isAbove = r.prevailing > r.srp;
              const variance = r.prevailing - r.srp;

              return (
                <tr key={index} style={rowStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{r.commodity}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>₱{r.prevailing.toFixed(2)}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#64748b" }}>₱{r.srp.toFixed(2)}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: isAbove ? "#ef4444" : "#64748b", fontWeight: "500" }}>
                      {variance > 0 ? `+₱${variance.toFixed(2)}` : "--"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(isAbove)}>
                      {isAbove ? "● Non-Compliant" : "● Compliant"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

const cardStyle = {
  background: "white",
  padding: "16px 20px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e2e8f0"
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#64748b"
};

const valueStyle = {
  fontSize: "1.8rem",
  fontWeight: "800",
  marginTop: "4px",
  color: "#1e293b"
};

const thStyle = {
  padding: "12px 10px",
  fontSize: "0.7rem",
  fontWeight: "700",
  color: "#94a3b8",
  borderBottom: "1px solid #f1f5f9"
};

const tdStyle = {
  padding: "16px 10px",
  borderBottom: "1px solid #f8fafc"
};

const rowStyle = {
  transition: "all 0.2s",
};

const badgeStyle = (isHigh) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: "600",
  backgroundColor: isHigh ? "#fef2f2" : "#f0fdf4",
  color: isHigh ? "#dc2626" : "#16a34a",
});