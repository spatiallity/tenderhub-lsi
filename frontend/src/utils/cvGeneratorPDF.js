import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Load Times New Roman font (fallback to default if not available)
const FONT_NAME = 'times';
const FONT_SIZE = 11;

/**
 * Format date to Indonesian format
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount) {
  if (!amount) return '-';
  try {
    return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
  } catch (e) {
    return `Rp ${amount}`;
  }
}

/**
 * Add section title
 */
function addSectionTitle(doc, text, y) {
  doc.setFont(FONT_NAME, 'bold');
  doc.setFontSize(FONT_SIZE);
  doc.text(text, 30, y);
  
  // Underline
  const textWidth = doc.getTextWidth(text);
  doc.line(30, y + 1, 30 + textWidth, y + 1);
  
  return y + 8; // Return next Y position
}

/**
 * Add 3-column data table (Label | : | Value)
 */
function addDataTable(doc, data, startY) {
  const tableData = data.map(([label, value]) => [label, ':', value || '-']);
  
  doc.autoTable({
    startY,
    head: [],
    body: tableData,
    theme: 'plain',
    styles: {
      font: FONT_NAME,
      fontSize: FONT_SIZE,
      cellPadding: 2,
      lineColor: [204, 204, 204],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'normal' },
      1: { cellWidth: 5, halign: 'center' },
      2: { cellWidth: 'auto', fontStyle: 'normal' },
    },
    margin: { left: 30, right: 25 },
  });
  
  return doc.lastAutoTable.finalY + 5;
}

/**
 * Generate CV as PDF
 */
export async function generateCVPDF(data) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let currentY = 20;

  // Title
  doc.setFont(FONT_NAME, 'bold');
  doc.setFontSize(12);
  doc.text('CURRICULUM VITAE', 105, currentY, { align: 'center' });
  currentY += 15;

  // SECTION 1: DATA PRIBADI
  currentY = addSectionTitle(doc, 'DATA PRIBADI', currentY);
  
  const dataPribadi = [
    ['Nama Lengkap', data.namaLengkap],
    ['Tempat, Tanggal Lahir', `${data.tempatLahir}, ${formatDate(data.tanggalLahir)}`],
    ['Agama', data.agama],
    ['Jenis Kelamin', data.jenisKelamin],
    ['Status Perkawinan', data.statusPerkawinan],
    ['Alamat Rumah Sesuai KTP', data.alamatKTP],
    ['Alamat Domisili', data.alamatDomisili],
    ['NIK KTP', data.nikKTP],
    ['No. NPWP', data.noNPWP],
    ['Kewarganegaraan', data.kewarganegaraan || 'Indonesia'],
    ['No. Telepon/HP', data.noTelepon],
    ['Alamat Email', data.email],
  ];
  
  currentY = addDataTable(doc, dataPribadi, currentY);

  // SECTION 2: LATAR BELAKANG PENDIDIKAN
  if (data.pendidikan && data.pendidikan.length > 0) {
    currentY = addSectionTitle(doc, 'LATAR BELAKANG PENDIDIKAN', currentY);
    
    data.pendidikan.forEach((pend, index) => {
      if (index > 0) {
        // Add separator
        doc.setFillColor(217, 217, 217);
        doc.rect(30, currentY, 155, 3, 'F');
        currentY += 5;
      }
      
      const pendData = [
        ['Jenjang Pendidikan', pend.jenjang],
        ['Tanggal Kelulusan', pend.tanggalLulus],
        ['Fakultas/Jurusan', pend.fakultasJurusan],
        ['Nama Perguruan Tinggi', pend.namaPerguruanTinggi],
        ['IPK', pend.ipk || '-'],
      ];
      
      currentY = addDataTable(doc, pendData, currentY);
    });
  }

  // SECTION 3: RINGKASAN PENGALAMAN KERJA
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    currentY = addSectionTitle(doc, 'RINGKASAN PENGALAMAN KERJA', currentY);
    
    const expTableData = data.pengalamanKerja.map((exp, index) => {
      const waktu = `${exp.lamaBekerjaTahun || 0} Tahun ${exp.lamaBekerjaBulan || 0} Bulan`;
      const periode = `${formatDate(exp.tanggalMulai)} - ${exp.tanggalSelesai === 'Sekarang' ? 'Sekarang' : formatDate(exp.tanggalSelesai)}`;
      
      return [
        index + 1,
        exp.namaInstansi,
        exp.posisi,
        exp.tingkatWilayah,
        waktu,
        periode,
      ];
    });

    doc.autoTable({
      startY: currentY,
      head: [['No', 'Nama Instansi/Lembaga', 'Posisi', 'Tingkat Wilayah', 'Waktu', 'Lama Bekerja']],
      body: expTableData,
      theme: 'plain',
      styles: {
        font: FONT_NAME,
        fontSize: 9,
        cellPadding: 2,
        lineColor: [204, 204, 204],
        lineWidth: 0.1,
      },
      headStyles: {
        fontStyle: 'bold',
        halign: 'center',
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 30, right: 25 },
    });
    
    currentY = doc.lastAutoTable.finalY + 5;
  }

  // SECTION 4: URAIAN PENGALAMAN KERJA
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    currentY = addSectionTitle(doc, 'URAIAN PENGALAMAN KERJA', currentY);
    
    data.pengalamanKerja.forEach((exp, index) => {
      if (index > 0) {
        // Add separator
        doc.setFillColor(217, 217, 217);
        doc.rect(30, currentY, 155, 3, 'F');
        currentY += 5;
      }
      
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      
      const uraianData = [
        ['Nama Proyek / Program', exp.namaProyek || exp.namaInstansi],
        ['Nama Instansi/Lembaga', exp.namaInstansi],
        ['Lokasi', exp.tingkatWilayah],
        ['Posisi/Jabatan', exp.posisi],
        ['Periode', `${formatDate(exp.tanggalMulai)} - ${exp.tanggalSelesai === 'Sekarang' ? 'Sekarang' : formatDate(exp.tanggalSelesai)}`],
        ['Nilai Kontrak', formatCurrency(exp.nilaiKontrak)],
        ['Uraian Tugas', exp.uraianTugas || '-'],
      ];
      
      currentY = addDataTable(doc, uraianData, currentY);
    });
  }

  // SECTION 5: KEMAMPUAN BAHASA
  if (data.bahasa && data.bahasa.length > 0) {
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    currentY = addSectionTitle(doc, 'KEMAMPUAN BAHASA', currentY);
    
    const bahasaTableData = data.bahasa.map((bhs, index) => [
      index + 1,
      bhs.bahasa,
      bhs.kemampuanLisan,
      bhs.kemampuanTulisan,
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['No', 'Bahasa', 'Lisan', 'Tulisan']],
      body: bahasaTableData,
      theme: 'plain',
      styles: {
        font: FONT_NAME,
        fontSize: FONT_SIZE,
        cellPadding: 2,
        lineColor: [204, 204, 204],
        lineWidth: 0.1,
      },
      headStyles: {
        fontStyle: 'bold',
        halign: 'center',
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 42.5, halign: 'center' },
        3: { cellWidth: 42.5, halign: 'center' },
      },
      margin: { left: 30, right: 25 },
    });
    
    currentY = doc.lastAutoTable.finalY + 5;
  }

  // PENUTUP: PERNYATAAN & TANDA TANGAN
  // Check if we need a new page
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }
  
  currentY += 10;
  
  doc.setFont(FONT_NAME, 'normal');
  doc.setFontSize(FONT_SIZE);
  
  const pernyataan = 'Yang bertanda tangan di bawah ini, saya menyatakan bahwa semua keterangan yang tercantum dalam daftar riwayat hidup ini adalah benar dan dapat dipertanggungjawabkan.';
  const splitPernyataan = doc.splitTextToSize(pernyataan, 155);
  doc.text(splitPernyataan, 30, currentY);
  currentY += splitPernyataan.length * 5 + 10;
  
  const kotaTanggal = `${data.kotaPenandatangan || 'Jakarta'}, ${formatDate(data.tanggalPenandatangan || new Date())}`;
  doc.text(kotaTanggal, 185, currentY, { align: 'right' });
  currentY += 5;
  
  doc.text('Yang Membuat Pernyataan,', 185, currentY, { align: 'right' });
  currentY += 30; // Space for signature
  
  doc.setFont(FONT_NAME, 'bold');
  doc.text(data.namaLengkap, 185, currentY, { align: 'right' });
  
  // Underline name
  const nameWidth = doc.getTextWidth(data.namaLengkap);
  doc.line(185 - nameWidth, currentY + 1, 185, currentY + 1);

  // Save PDF
  const fileName = `CV_${data.namaLengkap.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
  doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Gagal generate PDF: ${error.message}`);
  }
}
