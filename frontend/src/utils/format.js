export const formatRupiah = (nilai) => {
    if (nilai >= 1000000000) {
      const raw = (nilai / 1000000000).toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
      return `Rp ${raw} M`;
    }
    return `Rp ${Math.round(nilai / 1000000)} jt`;
  };
  
export const dateFrom = (base, delta) => {
    const d = new Date(base);
    d.setDate(d.getDate() + delta);
    return d;
};

export const formatDate = (date) => date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
export const formatMonthYear = (dateStr) => new Date(`${dateStr}T00:00:00+07:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
export const daysFromNow = (dateStr) => {
    return Math.ceil((new Date(`${dateStr}T23:59:59+07:00`) - new Date()) / 86400000);
};

export const initials = (name) => {
    if(!name) return '??';
    return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
};

export const normalizeWa = (raw) => {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    if (digits.startsWith('8')) digits = '62' + digits;
    if (!digits.startsWith('62')) digits = '62' + digits;
    return digits;
};

export const waLink = (raw, message) => {
    const num = normalizeWa(raw);
    if (!num) return '';
    const base = `https://wa.me/${num}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const portfolioColor = { FLP: "blue", SDA: "green", FITI: "amber" };
export const internalStatusColor = { "Dipantau": "gray", "Akan Diikuti": "amber", "Sudah Diikuti": "green", "Tidak Relevan": "red" };
export const levelColor = { "K/L": "gray", "Provinsi": "blue", "Kab/Kota": "teal" };
export const availabilityColor = { "Tersedia": "green", "Sedang Bertugas": "amber", "Tidak Tersedia": "red" };
export const avatarColors = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0e7490", "#be123c", "#0369a1", "#15803d"];

export const PRAKUAL_STAGES = [
    ["Pengumuman Prakualifikasi", "gray"],
    ["Download Dokumen Kualifikasi", "gray"],
    ["Penjelasan Dokumen Prakualifikasi", "cyan"],
    ["Kirim Persyaratan Kualifikasi", "blue"],
    ["Evaluasi Dokumen Kualifikasi", "amber"],
    ["Pembuktian Kualifikasi", "amber"],
    ["Penetapan Hasil Kualifikasi", "teal"],
    ["Pengumuman Hasil Prakualifikasi", "teal"],
    ["Masa Sanggah Prakualifikasi", "red"],
    ["Download Dokumen Pemilihan", "blue"],
    ["Pemberian Penjelasan", "cyan"],
    ["Upload Dokumen Penawaran", "indigo"],
    ["Pembukaan dan Evaluasi Penawaran File I: Administrasi dan Teknis", "purple"],
    ["Pengumuman Hasil Evaluasi Administrasi dan Teknis", "purple"],
    ["Pembukaan dan Evaluasi Penawaran File II: Harga", "purple"],
    ["Penetapan Pemenang", "teal"],
    ["Pengumuman Pemenang", "teal"],
    ["Masa Sanggah", "red"],
    ["Klarifikasi dan Negosiasi Teknis dan Biaya", "amber"],
    ["Surat Penunjukan Penyedia Barang/Jasa", "green"],
    ["Penandatanganan Kontrak", "green"],
];

export const PASCAKUAL_STAGES = [
    ["Pengumuman Pascakualifikasi", "gray"],
    ["Download Dokumen Pemilihan", "blue"],
    ["Pemberian Penjelasan", "cyan"],
    ["Upload Dokumen Penawaran", "indigo"],
    ["Pembukaan Dokumen Penawaran", "purple"],
    ["Evaluasi Administrasi, Kualifikasi, Teknis, dan Harga", "purple"],
    ["Pembuktian Kualifikasi", "amber"],
    ["Penetapan Pemenang", "teal"],
    ["Pengumuman Pemenang", "teal"],
    ["Masa Sanggah", "red"],
    ["Surat Penunjukan Penyedia Barang/Jasa", "green"],
    ["Penandatanganan Kontrak", "green"],
];

export const getStages = (metode) => metode === "Prakualifikasi" ? PRAKUAL_STAGES : PASCAKUAL_STAGES;
