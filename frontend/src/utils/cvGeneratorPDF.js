import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Format currency to Indonesian Rupiah
const formatRupiah = (amount) => {
  if (!amount) return '-';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Format date to Indonesian format
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const date = new Date(dateStr);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Calculate work duration
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '-';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0 && remainingMonths > 0) {
    return `${years} tahun ${remainingMonths} bulan`;
  } else if (years > 0) {
    return `${years} tahun`;
  } else {
    return `${remainingMonths} bulan`;
  }
};

export const generateCVPDF = (cvData) => {
  const { dataPribadi, pendidikan, pengalaman, bahasa, expertName } = cvData;

  // Create PDF with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set margins (3cm left, 2.5cm others)
  const marginLeft = 30;
  const marginRight = 25;
  const marginTop = 25;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let yPos = marginTop;

  // Title
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('CURRICULUM VITAE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Data Pribadi Section
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text('DATA PRIBADI', marginLeft, yPos);
  yPos += 5;

  doc.autoTable({
    startY: yPos,
    head: [],
    body: [
      ['Nama', ':', dataPribadi.nama || '-'],
      ['Tempat/Tanggal Lahir', ':', `${dataPribadi.tempatLahir || '-'}, ${formatDate(dataPribadi.tanggalLahir)}`],
      ['Agama', ':', dataPribadi.agama || '-'],
      ['Jenis Kelamin', ':', dataPribadi.jenisKelamin || '-'],
      ['Status Perkawinan', ':', dataPribadi.statusPerkawinan || '-'],
      ['Alamat KTP', ':', dataPribadi.alamatKTP || '-'],
      ['Alamat Domisili', ':', dataPribadi.alamatDomisili || '-'],
      ['NIK', ':', dataPribadi.nik || '-'],
      ['NPWP', ':', dataPribadi.npwp || '-'],
      ['Kewarganegaraan', ':', dataPribadi.kewarganegaraan || '-'],
      ['No. Telepon', ':', dataPribadi.noTelepon || '-'],
      ['Email', ':', dataPribadi.email || '-'],
    ],
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 11,
      cellPadding: 2,
      lineColor: [204, 204, 204],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.3 },
      1: { cellWidth: contentWidth * 0.05 },
      2: { cellWidth: contentWidth * 0.65 },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Pendidikan Section
  doc.setFont('times', 'bold');
  doc.text('LATAR BELAKANG PENDIDIKAN', marginLeft, yPos);
  yPos += 5;

  const pendidikanRows = [];
  pendidikan.forEach((edu, index) => {
    pendidikanRows.push(
      ['Jenjang', ':', edu.jenjang || '-'],
      ['Tanggal Lulus', ':', formatDate(edu.tanggalLulus)],
      ['Fakultas/Jurusan', ':', edu.fakultasJurusan || '-'],
      ['Nama Perguruan Tinggi', ':', edu.namaPerguruanTinggi || '-'],
      ['IPK', ':', edu.ipk || '-']
    );
    
    // Add separator between entries
    if (index < pendidikan.length - 1) {
      pendidikanRows.push(['', '', '']);
    }
  });

  doc.autoTable({
    startY: yPos,
    head: [],
    body: pendidikanRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 11,
      cellPadding: 2,
      lineColor: [204, 204, 204],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.3 },
      1: { cellWidth: contentWidth * 0.05 },
      2: { cellWidth: contentWidth * 0.65 },
    },
    margin: { left: marginLeft, right: marginRight },
    didParseCell: (data) => {
      // Add shading to separator rows
      if (data.row.index > 0 && data.cell.raw === '' && pendidikanRows[data.row.index][0] === '') {
        data.cell.styles.fillColor = [217, 217, 217];
      }
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = marginTop;
  }

  // Pengalaman Kerja Section
  doc.setFont('times', 'bold');
  doc.text('RINGKASAN PENGALAMAN KERJA', marginLeft, yPos);
  yPos += 5;

  doc.autoTable({
    startY: yPos,
    head: [['No', 'Nama Instansi', 'Nama Proyek', 'Posisi', 'Periode', 'Lama Bekerja']],
    body: pengalaman.map((exp, index) => [
      (index + 1).toString(),
      exp.namaInstansi || '-',
      exp.namaProyek || '-',
      exp.posisi || '-',
      `${formatDate(exp.periodeAwal)} - ${formatDate(exp.periodeAkhir)}`,
      calculateDuration(exp.periodeAwal, exp.periodeAkhir),
    ]),
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 2,
      lineColor: [204, 204, 204],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = marginTop;
  }

  // Uraian Pengalaman Kerja
  doc.setFont('times', 'bold');
  doc.text('URAIAN PENGALAMAN KERJA', marginLeft, yPos);
  yPos += 5;

  pengalaman.forEach((exp, index) => {
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = marginTop;
    }

    doc.autoTable({
      startY: yPos,
      head: [],
      body: [
        ['Nama Instansi', ':', exp.namaInstansi || '-'],
        ['Nama Proyek', ':', exp.namaProyek || '-'],
        ['Posisi', ':', exp.posisi || '-'],
        ['Tingkat Wilayah', ':', exp.tingkatWilayah || '-'],
        ['Periode Kerja', ':', `${formatDate(exp.periodeAwal)} - ${formatDate(exp.periodeAkhir)}`],
        ['Lama Bekerja', ':', calculateDuration(exp.periodeAwal, exp.periodeAkhir)],
        ['Nilai Kontrak', ':', formatRupiah(exp.nilaiKontrak)],
        ['Uraian Tugas', ':', exp.uraianTugas || '-'],
      ],
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        cellPadding: 2,
        lineColor: [204, 204, 204],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.3 },
        1: { cellWidth: contentWidth * 0.05 },
        2: { cellWidth: contentWidth * 0.65 },
      },
      margin: { left: marginLeft, right: marginRight },
    });

    yPos = doc.lastAutoTable.finalY + 5;
  });

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = marginTop;
  }

  // Kemampuan Bahasa
  doc.setFont('times', 'bold');
  doc.text('KEMAMPUAN BAHASA', marginLeft, yPos);
  yPos += 5;

  doc.autoTable({
    startY: yPos,
    head: [['No', 'Nama Bahasa', 'Kemampuan Lisan', 'Kemampuan Tulisan']],
    body: bahasa.map((lang, index) => [
      (index + 1).toString(),
      lang.namaBahasa || '-',
      lang.kemampuanLisan || '-',
      lang.kemampuanTulisan || '-',
    ]),
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 11,
      cellPadding: 2,
      lineColor: [204, 204, 204],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = marginTop;
  }

  // Pernyataan
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text('Demikian curriculum vitae ini saya buat dengan sebenarnya.', marginLeft, yPos);
  yPos += 10;

  doc.text(`${dataPribadi.tempatLahir}, ${formatDate(new Date())}`, pageWidth - marginRight, yPos, { align: 'right' });
  yPos += 20;

  doc.text(dataPribadi.nama, pageWidth - marginRight, yPos, { align: 'right' });

  // Save PDF
  const fileName = `CV_${expertName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
  doc.save(fileName);
};
