import React, { useMemo, useState } from "react";

const formatCurrency = (value) => `\u20b1${Number(value || 0).toFixed(2)}`;

export default function Inquiry({ prices }) {
  const [selectedId, setSelectedId] = useState("");
  const [letter, setLetter] = useState({
    subject: "Letter of Inquiry",
    officer: "",
    date: new Date().toISOString().split("T")[0],
    content: ""
  });

  const flaggedItems = useMemo(
    () => prices.filter((p) => Number(p.srp || 0) > 0 && Number(p.price) > Number(p.srp)),
    [prices]
  );

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const item = prices.find((p) => p.id === id);
    if (item) generateContent(item);
  };

  const generateContent = (item) => {
    const price = Number(item.price || 0);
    const srp = Number(item.srp || 0);
    const variance = price - srp;
    const dateObserved = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const body = `Dear ${item.store || "Establishment"},\n\nSubject: Price Inquiry - ${item.commodity || "Commodity"}\n\nDuring our monitoring on ${dateObserved} at ${item.store || "your establishment"} in ${item.municipality || "the covered area"}, we recorded a retail price of ${formatCurrency(price)} for ${item.commodity || "the item"}. The Suggested Retail Price (SRP) on record is ${formatCurrency(srp)}, indicating a variance of ${formatCurrency(variance)}.\n\nIn line with the Consumer Act and DTI price stabilization efforts, kindly provide a written explanation within three (3) days from receipt of this letter regarding the observed price variance. Please include recent supplier invoices, delivery receipts, and any factors affecting your pricing.\n\nYou may submit your response via email or directly to the DTI office. Should you require clarification, please contact our office immediately.\n\nThank you for your prompt cooperation.\n\nRespectfully,\n${letter.officer || "Monitoring Officer"}`;

    setLetter((prev) => ({ ...prev, subject: `Price Inquiry - ${item.commodity || "Commodity"}`, content: body }));
  };

  const handleLetterChange = (e) => {
    const { name, value } = e.target;
    setLetter((prev) => ({ ...prev, [name]: value }));
  };

  const printLetter = () => {
    if (!letter.content.trim()) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${letter.subject}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 40px; line-height: 1.6; }
            h2 { text-align: center; margin-bottom: 10px; }
            .meta { text-align: center; margin-bottom: 30px; color: #444; }
            pre { white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; }
            .signature { margin-top: 60px; }
            .sig-line { margin-top: 40px; width: 240px; border-top: 1px solid #000; }
          </style>
        </head>
        <body>
          <h2>${letter.subject}</h2>
          <div class="meta">Date: ${letter.date}</div>
          <pre>${letter.content}</pre>
          <div class="signature">
            <div class="sig-line"></div>
            <div>${letter.officer || "Monitoring Officer"}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  const selectedItem = prices.find((p) => p.id === selectedId);
  const variance = selectedItem ? Number(selectedItem.price || 0) - Number(selectedItem.srp || 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Generate Letter of Inquiry</h3>
            <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>Select a monitored price entry to auto-draft a letter.</p>
          </div>
          <span style={tagStyle}>Auto-generated, editable</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Price Entry</label>
            <select value={selectedId} onChange={handleSelect} style={inputStyle}>
              <option value="">Select price record</option>
              {prices.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.commodity || "Item"} — ${p.store || "Store"} (${formatCurrency(p.price)} vs SRP ${formatCurrency(p.srp)})`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={badgeBoxStyle("#fff7ed", "#f97316")}>SRP: {formatCurrency(selectedItem?.srp || 0)}</div>
            <div style={badgeBoxStyle("#fef2f2", variance > 0 ? "#dc2626" : "#22c55e")}>
              Variance: {formatCurrency(variance)}
            </div>
          </div>
        </div>

        {selectedItem && (
          <div style={{ marginTop: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.95rem", color: "#0f172a" }}>
              <span><strong>Commodity:</strong> {selectedItem.commodity || "--"}</span>
              <span><strong>Store:</strong> {selectedItem.store || "--"}</span>
              <span><strong>Municipality:</strong> {selectedItem.municipality || "--"}</span>
              <span><strong>Date:</strong> {selectedItem.timestamp ? new Date(selectedItem.timestamp).toLocaleDateString() : "--"}</span>
            </div>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Subject</label>
            <input name="subject" value={letter.subject} onChange={handleLetterChange} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" name="date" value={letter.date} onChange={handleLetterChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Officer</label>
              <input name="officer" value={letter.officer} onChange={handleLetterChange} style={inputStyle} placeholder="Name / Position" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label style={labelStyle}>Letter Body</label>
          <textarea
            name="content"
            value={letter.content}
            onChange={handleLetterChange}
            rows={14}
            style={{ ...inputStyle, minHeight: "240px", fontFamily: "'Inter', sans-serif" }}
            placeholder="Auto-generated letter will appear here."
          />
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            onClick={() => selectedItem && generateContent(selectedItem)}
            style={{ ...buttonStyle, background: "#e2e8f0", color: "#0f172a" }}
            disabled={!selectedItem}
          >
            Regenerate Letter
          </button>
          <button
            onClick={printLetter}
            style={{ ...buttonStyle, background: "#0f172a", color: "white" }}
            disabled={!letter.content.trim()}
          >
            Print Letter
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h4 style={{ margin: 0, color: "#0f172a" }}>Flagged Entries (Price above SRP)</h4>
          <span style={tagStyle}>{flaggedItems.length} item(s)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b", fontSize: "0.75rem" }}>
                <th style={thStyle}>Commodity</th>
                <th style={thStyle}>Store</th>
                <th style={thStyle}>Municipality</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>SRP</th>
                <th style={thStyle}>Variance</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedItems.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No entries above SRP.</td>
                </tr>
              )}
              {flaggedItems.map((p) => {
                const v = Number(p.price || 0) - Number(p.srp || 0);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{p.commodity || "--"}</td>
                    <td style={tdStyle}>{p.store || "--"}</td>
                    <td style={tdStyle}>{p.municipality || "--"}</td>
                    <td style={tdStyle}>{formatCurrency(p.price)}</td>
                    <td style={tdStyle}>{formatCurrency(p.srp)}</td>
                    <td style={{ ...tdStyle, color: v > 0 ? "#dc2626" : "#0f172a" }}>{formatCurrency(v)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => { setSelectedId(p.id); generateContent(p); }}
                        style={{ ...miniButtonStyle, background: "#0f172a", color: "white" }}
                      >
                        Draft Letter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%"
};

const labelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: "700",
  letterSpacing: "0.02em",
  color: "#475569",
  marginBottom: "6px"
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer"
};

const miniButtonStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "700",
  fontSize: "0.8rem",
  cursor: "pointer"
};

const thStyle = {
  padding: "10px 8px",
  fontWeight: "700",
  fontSize: "0.75rem"
};

const tdStyle = {
  padding: "12px 8px",
  fontSize: "0.9rem",
  color: "#0f172a"
};

const tagStyle = {
  background: "#0f172a",
  color: "white",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: "700"
};

const badgeBoxStyle = (bg, color) => ({
  background: bg,
  color,
  borderRadius: "12px",
  padding: "10px 12px",
  fontWeight: "700",
  border: `1px solid ${color}33`,
  textAlign: "center"
});
