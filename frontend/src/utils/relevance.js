export const calcRelevance = (tender, keywords) => {
    // Expected keywords structure: { SDA: [{id, text, active}], FLP: [...], FITI: [...] }
    const active = Object.entries(keywords).flatMap(([portfolio, items]) =>
      items.filter(k => k.active).map(k => ({ ...k, portfolio }))
    );
    const lower = (tender.nama || tender.nama_paket || "").toLowerCase();
    const matched = active.filter(k => lower.includes(k.text.toLowerCase()));
    
    const byPortfolio = matched.reduce((acc, k) => ({ ...acc, [k.portfolio]: (acc[k.portfolio] || 0) + 1 }), {});
    const recommendation = Object.entries(byPortfolio).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    
    const samePortfolioHit = matched.some(k => k.portfolio === recommendation);
    const n = matched.length;
    
    let score = Math.min(100, Math.max(n ? 18 : 18, n * 28 + (samePortfolioHit ? 12 : 0)));
    if (n === 0) score = 18;
    
    return {
      score,
      matched: matched.map(k => k.text),
      recommendation
    };
  };
