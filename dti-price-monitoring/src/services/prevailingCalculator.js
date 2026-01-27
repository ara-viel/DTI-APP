// Computes prevailing price for a set of price records for the same commodity/size/store.
// Rules:
// 1) Use mode (most frequent price). If multiple modes, pick the most recent among them.
// 2) If no mode (all unique), use the highest price (most recent if ties).
// 3) If the chosen prevailing is above SRP and SRP > 0, cap it at SRP.
export function computePrevailingPrice(prices = [], srp = 0) {
  if (!Array.isArray(prices) || prices.length === 0) return 0;

  // Build frequency map keyed by price (rounded to cents) with most recent timestamp
  const freq = new Map();
  prices.forEach((p) => {
    const price = Number(p.price) || 0;
    const ts = Number(p.ts) || 0;
    const key = price.toFixed(2);
    const existing = freq.get(key);
    if (!existing) {
      freq.set(key, { count: 1, ts });
    } else {
      freq.set(key, {
        count: existing.count + 1,
        ts: Math.max(existing.ts, ts),
      });
    }
  });

  // Find mode: highest count; break ties by latest timestamp
  let modePrice = null;
  let modeCount = 0;
  let modeTs = -1;
  freq.forEach((info, key) => {
    if (info.count > modeCount || (info.count === modeCount && info.ts > modeTs)) {
      modePrice = Number(key);
      modeCount = info.count;
      modeTs = info.ts;
    }
  });

  // Determine if a true mode exists (count > 1)
  let prevailing = 0;
  if (modeCount > 1 && modePrice !== null) {
    prevailing = modePrice;
  } else {
    // No mode: pick the highest price; if tie, latest timestamp
    prevailing = prices.reduce((best, curr) => {
      const price = Number(curr.price) || 0;
      const ts = Number(curr.ts) || 0;
      if (price > best.price) return { price, ts };
      if (price === best.price && ts > best.ts) return { price, ts };
      return best;
    }, { price: 0, ts: -1 }).price;
  }

  // Cap at SRP if above SRP and SRP is provided
  if (Number(srp) > 0 && prevailing > Number(srp)) {
    prevailing = Number(srp);
  }

  return Number(prevailing.toFixed(2));
}
