"""
Relevance engine – identik dengan logika calcRelevance() di mockup HTML.
"""

from typing import List, Dict, Any


def calculate_relevance(nama_paket: str, keywords: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Hitung relevance score tender berdasarkan keyword aktif.
    keywords: list of {"id", "text", "subporto", "is_active"}
    Return: {"score": float, "matched_keywords": list[str], "recommended_subporto": str}
    """
    active = [k for k in keywords if k.get("is_active", True)]
    lower = nama_paket.lower()

    matched = [k for k in active if k["text"].lower() in lower]

    by_subporto: Dict[str, int] = {}
    for k in matched:
        sp = k.get("subporto", "")
        by_subporto[sp] = by_subporto.get(sp, 0) + 1

    if by_subporto:
        recommendation = max(by_subporto, key=lambda x: by_subporto[x])
    else:
        recommendation = ""

    same_portfolio_hit = any(k.get("subporto") == recommendation for k in matched)
    n = len(matched)
    score = min(100, max(n if n else 18, n * 28 + (12 if same_portfolio_hit else 0)))
    if n == 0:
        score = 18

    return {
        "score": float(score),
        "matched_keywords": [k["text"] for k in matched],
        "recommended_subporto": recommendation,
    }


def calculate_rup_readiness(
    nama_paket: str,
    uraian: str,
    spesifikasi: str,
    metode_pengadaan: str,
    tgl_awal_pemilihan: str,
    keywords: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Hitung readiness score paket RUP.
    """
    from datetime import date

    text = f"{nama_paket} {uraian} {spesifikasi}".lower()
    active = [k for k in keywords if k.get("is_active", True)]
    matched = [k for k in active if k["text"].lower() in text]

    by_subporto: Dict[str, int] = {}
    for k in matched:
        sp = k.get("subporto", "")
        by_subporto[sp] = by_subporto.get(sp, 0) + 1

    recommendation = max(by_subporto, key=lambda x: by_subporto[x]) if by_subporto else ""

    readiness_base = 68 if metode_pengadaan == "Seleksi" else 52
    try:
        target = date.fromisoformat(tgl_awal_pemilihan)
        days = (target - date.today()).days
    except Exception:
        days = 999

    urgency_bonus = 18 if days <= 45 else 10 if days <= 90 else 4
    readiness = min(100, readiness_base + urgency_bonus + len(matched) * 4)

    return {
        "matched_keywords": [k["text"] for k in matched],
        "recommended_subporto": recommendation,
        "readiness": readiness,
        "days_until_selection": days,
    }
