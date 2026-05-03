import { TODAY, PRAKUAL_STAGES, PASCAKUAL_STAGES } from './constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const formatRupiah = (nilai) => {
  if (!nilai) return 'Rp 0';
  if (nilai >= 1000000000) {
    const raw = (nilai / 1000000000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
    return `Rp ${raw} M`;
  }
  return `Rp ${Math.round(nilai / 1000000)} jt`;
};

export const dateFrom = (base, delta) => {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
};

export const formatDate = (date) =>
  date instanceof Date
    ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

export const formatMonthYear = (dateStr) =>
  dateStr ? new Date(`${dateStr}T00:00:00+07:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-';

export const daysFromNow = (dateStr) => {
  if (!dateStr) return 999;
  const target = new Date(`${dateStr}T00:00:00+07:00`);
  const today = new Date(TODAY);
  today.setHours(0, 0, 0, 0);
  return Math.floor((target - today) / 86400000);
};

export const initials = (name) =>
  (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const getStages = (metode) => metode === 'Prakualifikasi' ? PRAKUAL_STAGES : PASCAKUAL_STAGES;

export const calcRelevance = (tender, keywords) => {
  const active = Object.entries(keywords).flatMap(([portfolio, items]) =>
    items.filter(k => k.active).map(k => ({ ...k, portfolio }))
  );
  const lower = (tender.nama || '').toLowerCase();
  const matched = active.filter(k => lower.includes(k.text.toLowerCase()));
  const byPortfolio = matched.reduce((acc, k) => ({ ...acc, [k.portfolio]: (acc[k.portfolio] || 0) + 1 }), {});
  const recommendation = Object.entries(byPortfolio).sort((a, b) => b[1] - a[1])[0]?.[0] || tender.portofolio || 'SDA';
  const samePortfolioHit = matched.some(k => k.portfolio === recommendation);
  const score = Math.min(100, Math.max(matched.length ? 38 : 18, matched.length * 28 + (samePortfolioHit ? 12 : 0)));
  return { score, matched: matched.map(k => k.text), recommendation };
};

export const calcRupMatch = (rup, keywords) => {
  const text = `${rup.nama_paket} ${rup.uraian_pekerjaan || ''} ${rup.spesifikasi_pekerjaan || ''}`.toLowerCase();
  const active = Object.entries(keywords).flatMap(([portfolio, items]) =>
    items.filter(k => k.active).map(k => ({ ...k, portfolio }))
  );
  const matched = active.filter(k => text.includes(k.text.toLowerCase()));
  const byPortfolio = matched.reduce((acc, k) => ({ ...acc, [k.portfolio]: (acc[k.portfolio] || 0) + 1 }), {});
  const recommendation = Object.entries(byPortfolio).sort((a, b) => b[1] - a[1])[0]?.[0] || rup.portofolio || 'SDA';
  const readinessBase = rup.metode_pengadaan === 'Seleksi' ? 68 : 52;
  // Normalize to 1st of the month since RUP dates are month-level precision
  const rawDate = rup.tgl_awal_pemilihan;
  const firstOfMonth = rawDate ? rawDate.substring(0, 7) + '-01' : null;
  const days = daysFromNow(firstOfMonth);
  const urgencyBonus = days <= 45 ? 18 : days <= 90 ? 10 : 4;
  return {
    matched: matched.map(k => k.text),
    recommendation,
    readiness: Math.min(100, readinessBase + urgencyBonus + matched.length * 4),
    daysUntilSelection: days,
  };
};

export const activeKeywordCount = (keywords) =>
  Object.values(keywords).flat().filter(k => k.active).length;

const submitGateStageByMethod = (metode) => metode === 'Prakualifikasi' ? 4 : 4;

const getStageDeadlineFromSchedule = (tender, stageNo, stageName) => {
  const stageKeys = [
    'stageDeadlines',
    'stage_deadlines',
    'jadwalTahapan',
    'jadwal_tahapan',
    'tahapan',
  ];

  for (const key of stageKeys) {
    const schedule = tender[key];
    if (!schedule) continue;

    if (Array.isArray(schedule)) {
      const item = schedule.find((s, idx) =>
        idx + 1 === stageNo ||
        Number(s?.stageNo || s?.stage || s?.no || s?.urutan) === stageNo ||
        s?.name === stageName ||
        s?.nama === stageName ||
        s?.tahap === stageName ||
        s?.nama_tahapan === stageName ||
        s?.namaTahapan === stageName
      );
      const endDate =
        item?.endDate ||
        item?.end_date ||
        item?.end ||
        item?.tanggalAkhir ||
        item?.tanggal_akhir ||
        item?.tgl_akhir ||
        item?.tglAkhir ||
        item?.tanggal_selesai ||
        item?.tgl_selesai ||
        item?.selesai ||
        item?.akhir;
      if (endDate) return endDate;
    }

    if (typeof schedule === 'object') {
      const item = schedule[stageNo] || schedule[String(stageNo)] || schedule[stageName];
      if (typeof item === 'string') return item;
      const endDate =
        item?.endDate ||
        item?.end_date ||
        item?.end ||
        item?.tanggalAkhir ||
        item?.tanggal_akhir ||
        item?.tgl_akhir ||
        item?.tglAkhir ||
        item?.tanggal_selesai ||
        item?.tgl_selesai ||
        item?.selesai ||
        item?.akhir;
      if (endDate) return endDate;
    }
  }

  return null;
};

export const enrichTender = (tender, keywords, internalStatuses = {}) => {
  // Validate required fields
  if (!tender || !tender.id) {
    console.warn('enrichTender: Invalid tender object', tender);
    return tender;
  }
  
  if (!tender.metode || !tender.currentStage) {
    console.warn(`enrichTender: Missing required fields for tender ${tender.id}`, { metode: tender.metode, currentStage: tender.currentStage });
    return { 
      ...tender, 
      error: 'Missing required fields',
      totalStages: 0,
      currentStageName: 'Unknown',
      currentStageColor: 'gray',
      deadlineStage: null,
      daysLeft: 999,
      deadlinePassed: false,
      internalStatus: internalStatuses[tender.id] || tender.internalStatus || 'Dipantau',
    };
  }
  
  const relevance = calcRelevance(tender, keywords);
  const stages = getStages(tender.metode);
  
  // Ensure currentStage is within valid range
  const currentStage = Math.max(1, Math.min(tender.currentStage || 1, stages.length));
  
  const currentStageName = stages[currentStage - 1]?.[0] || 'Unknown Stage';
  const currentStageColor = stages[currentStage - 1]?.[1] || 'gray';
  const submitGateStage = submitGateStageByMethod(tender.metode);
  const submitGateStageName = stages[submitGateStage - 1]?.[0] || '';
  const currentStageDeadline =
    tender.currentStageDeadline ||
    tender.deadlineCurrentStage ||
    tender.tgl_akhir_tahap_berjalan ||
    getStageDeadlineFromSchedule(tender, currentStage, currentStageName) ||
    tender.deadlineStage;
  const rawDaysLeft = daysFromNow(currentStageDeadline);
  const internalStatus = (internalStatuses[tender.id] || tender.internalStatus || 'Dipantau').trim();
  const submitDeadline =
    tender.submitDeadlineStage ||
    tender.deadlineSubmitStage ||
    tender.deadlineSubmitGate ||
    tender.tgl_akhir_submit ||
    getStageDeadlineFromSchedule(tender, submitGateStage, submitGateStageName) ||
    (currentStage <= submitGateStage ? tender.deadlineStage : null);
  return {
    ...tender,
    ...relevance,
    totalStages: stages.length,
    currentStageName,
    currentStageColor,
    deadlineRefStageNo: currentStage,
    deadlineRefStageName: currentStageName,
    deadlineStageName: currentStageName,
    deadlineStage: currentStageDeadline,
    deadlineCurrentStageDate: currentStageDeadline,
    deadlineSubmitGateStage: submitGateStage,
    deadlineSubmitGateStageName: submitGateStageName,
    deadlineSubmitGateDate: submitDeadline,
    deadlinePassed: rawDaysLeft < 0,
    daysLeft: rawDaysLeft,
    internalStatus,
    stages,
  };
};

export const exportTendersExcel = (tenders) => {
  const data = tenders.map((t, i) => ({
    'No': i + 1,
    'Nama Paket': t.nama,
    'Instansi': t.instansi,
    'Level': t.level,
    'Provinsi': t.provinsi,
    'HPS': t.hps,
    'Portofolio': t.recommendation,
    'Metode': t.metode,
    'Tahap': t.currentStageName,
    'Deadline': t.deadlineStage,
    'Status Internal': t.internalStatus,
    'Link SPSE': t.lpse || '-',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tender Intelligence');
  XLSX.writeFile(wb, 'tender_intelligence_export.xlsx', { bookType: 'xlsx' });
};

export const exportTendersPDF = (tenders) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text('Tender Intelligence Export', 14, 18);
  doc.setFontSize(9);
  doc.text(`Exported: ${new Date().toLocaleDateString('id-ID')}`, 14, 24);
  const head = [['No', 'Nama Paket', 'Instansi', 'Level', 'Provinsi', 'HPS', 'Portofolio', 'Tahap', 'Deadline', 'Status']];
  const body = tenders.map((t, i) => [
    i + 1, t.nama?.substring(0, 50), t.instansi?.substring(0, 30), t.level, t.provinsi,
    (t.hps || 0).toLocaleString('id-ID'), t.recommendation, t.currentStageName?.substring(0, 25),
    t.deadlineStage || '-', t.internalStatus || 'Dipantau',
  ]);
  doc.autoTable({ head, body, startY: 28, styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [37, 99, 235], fontSize: 7 }, alternateRowStyles: { fillColor: [248, 250, 252] } });
  doc.save('tender_intelligence_export.pdf');
};

export const exportRupExcel = (rupList) => {
  const data = rupList.map((r, i) => ({
    'No': i + 1,
    'Nama Paket': r.nama_paket,
    'Satker': r.nama_satker,
    'Pagu': r.pagu,
    'Metode': r.metode_pengadaan,
    'Sumber Dana': r.sumber_dana,
    'Kualifikasi': r.kualifikasi,
    'Awal Pemilihan': r.tgl_awal_pemilihan,
    'Portofolio': r.recommendation,
    'Link SIRUP': r.kd_klpd ? `https://sirup.inaproc.id/sirup/ro/rekap/klpd/${r.kd_klpd}` : '-',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RUP Data');
  XLSX.writeFile(wb, 'rup_export.xlsx', { bookType: 'xlsx' });
};

export const exportRupPDF = (rupList) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text('Rencana Umum Pengadaan (RUP) Export', 14, 18);
  doc.setFontSize(9);
  doc.text(`Exported: ${new Date().toLocaleDateString('id-ID')}`, 14, 24);
  const head = [['No', 'Nama Paket', 'Satker', 'Pagu', 'Metode', 'Sumber Dana', 'Kualifikasi', 'Awal Pemilihan', 'Portofolio']];
  const body = rupList.map((r, i) => [
    i + 1, r.nama_paket?.substring(0, 50), r.nama_satker?.substring(0, 30),
    (r.pagu || 0).toLocaleString('id-ID'), r.metode_pengadaan || '-', r.sumber_dana || '-',
    r.kualifikasi || '-', r.tgl_awal_pemilihan || '-', r.recommendation || '-',
  ]);
  doc.autoTable({ head, body, startY: 28, styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [37, 99, 235], fontSize: 7 }, alternateRowStyles: { fillColor: [248, 250, 252] } });
  doc.save('rup_export.pdf');
};
