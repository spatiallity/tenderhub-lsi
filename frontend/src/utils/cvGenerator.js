import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  ImageRun,
  HeadingLevel,
} from 'docx';
import { saveAs } from 'file-saver';

// Constants for document formatting
const FONT_NAME = 'Times New Roman';
const FONT_SIZE = 22; // 11pt in half-points
const TABLE_WIDTH = 8787; // DXA units for A4 with margins
const COL_LABEL = 2551; // ~4.5cm
const COL_COLON = 283; // ~0.5cm
const COL_VALUE = TABLE_WIDTH - COL_LABEL - COL_COLON;

// Border styling
const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'CCCCCC',
};

const allBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

// Cell margins
const cellMargins = {
  top: 80,
  bottom: 80,
  left: 120,
  right: 120,
};

/**
 * Create a section title paragraph
 */
function createSectionTitle(text) {
  return new Paragraph({
    text,
    bold: true,
    underline: {},
    allCaps: true,
    font: FONT_NAME,
    size: FONT_SIZE,
    spacing: { before: 240, after: 120 },
  });
}

/**
 * Create a 3-column row (Label | : | Value)
 */
function createDataRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: label, font: FONT_NAME, size: FONT_SIZE })],
        width: { size: COL_LABEL, type: WidthType.DXA },
        borders: allBorders,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ text: ':', font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
        width: { size: COL_COLON, type: WidthType.DXA },
        borders: allBorders,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ text: value || '-', font: FONT_NAME, size: FONT_SIZE })],
        width: { size: COL_VALUE, type: WidthType.DXA },
        borders: allBorders,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
      }),
    ],
  });
}

/**
 * Create a separator row with gray shading
 */
function createSeparatorRow() {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: '' })],
        columnSpan: 3,
        shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
        borders: allBorders,
        margins: { top: 40, bottom: 40, left: 120, right: 120 },
      }),
    ],
  });
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const date = new Date(dateStr);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount) {
  if (!amount) return '-';
  return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
}

/**
 * Generate CV Document
 */
export async function generateCV(data) {
  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: 'CURRICULUM VITAE',
      bold: true,
      font: FONT_NAME,
      size: 24, // 12pt
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  );

  // SECTION 1: DATA PRIBADI
  sections.push(createSectionTitle('DATA PRIBADI'));
  
  const dataPribadiRows = [
    createDataRow('Nama Lengkap', data.namaLengkap),
    createDataRow('Tempat, Tanggal Lahir', `${data.tempatLahir}, ${formatDate(data.tanggalLahir)}`),
    createDataRow('Agama', data.agama),
    createDataRow('Jenis Kelamin', data.jenisKelamin),
    createDataRow('Status Perkawinan', data.statusPerkawinan),
    createDataRow('Alamat Rumah Sesuai KTP', data.alamatKTP),
    createDataRow('Alamat Domisili', data.alamatDomisili),
    createDataRow('NIK KTP', data.nikKTP),
    createDataRow('No. NPWP', data.noNPWP),
    createDataRow('Kewarganegaraan', data.kewarganegaraan || 'Indonesia'),
    createDataRow('No. Telepon/HP', data.noTelepon),
    createDataRow('Alamat Email', data.email),
  ];

  sections.push(
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      rows: dataPribadiRows,
    })
  );

  // SECTION 2: LATAR BELAKANG PENDIDIKAN
  if (data.pendidikan && data.pendidikan.length > 0) {
    sections.push(createSectionTitle('LATAR BELAKANG PENDIDIKAN'));
    
    const pendidikanRows = [];
    data.pendidikan.forEach((pend, index) => {
      if (index > 0) pendidikanRows.push(createSeparatorRow());
      
      pendidikanRows.push(
        createDataRow('Jenjang Pendidikan', pend.jenjang),
        createDataRow('Tanggal Kelulusan', pend.tanggalLulus),
        createDataRow('Fakultas/Jurusan', pend.fakultasJurusan),
        createDataRow('Nama Perguruan Tinggi', pend.namaPerguruanTinggi),
        createDataRow('IPK', pend.ipk || '-')
      );
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: pendidikanRows,
      })
    );
  }

  // SECTION 3: RINGKASAN PENGALAMAN KERJA
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    sections.push(createSectionTitle('RINGKASAN PENGALAMAN KERJA'));
    
    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'No', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 567, type: WidthType.DXA }, // 1cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Nama Instansi/Lembaga/Program', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 3118, type: WidthType.DXA }, // 5.5cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Posisi', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 2268, type: WidthType.DXA }, // 4cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Tingkat Wilayah', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 1417, type: WidthType.DXA }, // 2.5cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Waktu', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 1134, type: WidthType.DXA }, // 2cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Lama Bekerja', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 1417, type: WidthType.DXA }, // 2.5cm
          borders: allBorders,
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });

    const dataRows = data.pengalamanKerja.map((exp, index) => {
      const waktu = `${exp.lamaBekerjaTahun || 0} Tahun ${exp.lamaBekerjaBulan || 0} Bulan`;
      const periode = `${formatDate(exp.tanggalMulai)} - ${exp.tanggalSelesai === 'Sekarang' ? 'Sekarang' : formatDate(exp.tanggalSelesai)}`;
      
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: String(index + 1), font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: exp.namaInstansi, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: exp.posisi, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: exp.tingkatWilayah, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: waktu, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: periode, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      });
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [headerRow, ...dataRows],
      })
    );
  }

  // SECTION 4: URAIAN PENGALAMAN KERJA (Detail)
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    sections.push(createSectionTitle('URAIAN PENGALAMAN KERJA'));
    
    const uraianRows = [];
    data.pengalamanKerja.forEach((exp, index) => {
      if (index > 0) uraianRows.push(createSeparatorRow());
      
      uraianRows.push(
        createDataRow('Nama Proyek / Program', exp.namaProyek || exp.namaInstansi),
        createDataRow('Nama Instansi/Lembaga', exp.namaInstansi),
        createDataRow('Lokasi', exp.tingkatWilayah),
        createDataRow('Posisi/Jabatan', exp.posisi),
        createDataRow('Periode', `${formatDate(exp.tanggalMulai)} - ${exp.tanggalSelesai === 'Sekarang' ? 'Sekarang' : formatDate(exp.tanggalSelesai)}`),
        createDataRow('Nilai Kontrak', formatCurrency(exp.nilaiKontrak)),
        createDataRow('Uraian Tugas', exp.uraianTugas || '-')
      );
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: uraianRows,
      })
    );
  }

  // SECTION 5: SERTIFIKASI & KEAHLIAN
  if (data.sertifikasi && data.sertifikasi.length > 0) {
    sections.push(createSectionTitle('SERTIFIKASI & KEAHLIAN'));
    
    const sertifikasiRows = [];
    data.sertifikasi.forEach((sert, index) => {
      if (index > 0) sertifikasiRows.push(createSeparatorRow());
      
      sertifikasiRows.push(
        createDataRow('Bidang Keahlian Utama', sert.bidang),
        createDataRow('Nama Sertifikat/SKA/SKT', sert.namaSertifikat),
        createDataRow('Nomor Sertifikat', sert.nomorSertifikat),
        createDataRow('Lembaga Penerbit', sert.lembagaPenerbit),
        createDataRow('Tahun Terbit', sert.tahunTerbit),
        createDataRow('Masa Berlaku', sert.masaBerlaku)
      );
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: sertifikasiRows,
      })
    );
  }

  // SECTION 6: PELATIHAN & PENDIDIKAN NON-FORMAL
  if (data.pelatihan && data.pelatihan.length > 0) {
    sections.push(createSectionTitle('PELATIHAN & PENDIDIKAN NON-FORMAL'));
    
    const pelatihanHeaderRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'No', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 567, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Nama Pelatihan', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 4000, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Penyelenggara', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 2500, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Tahun', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 900, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Durasi', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 820, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
      ],
    });

    const pelatihanDataRows = data.pelatihan.map((pel, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: String(index + 1), font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: pel.namaPelatihan, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: pel.penyelenggara, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: pel.tahun, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: pel.durasi, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
        ],
      });
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [pelatihanHeaderRow, ...pelatihanDataRows],
      })
    );
  }

  // SECTION 7: ORGANISASI PROFESI
  if (data.organisasi && data.organisasi.length > 0) {
    sections.push(createSectionTitle('ORGANISASI PROFESI'));
    
    const orgHeaderRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'No', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 567, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Nama Organisasi', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 4000, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Jabatan', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 3000, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Tahun', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 1220, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
      ],
    });

    const orgDataRows = data.organisasi.map((org, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: String(index + 1), font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: org.namaOrganisasi, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: org.jabatan, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: org.tahunMasuk, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
        ],
      });
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [orgHeaderRow, ...orgDataRows],
      })
    );
  }

  // SECTION 8: KEMAMPUAN BAHASA
  if (data.bahasa && data.bahasa.length > 0) {
    sections.push(createSectionTitle('KEMAMPUAN BAHASA'));
    
    const bahasaHeaderRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'No', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 567, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Bahasa', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 2500, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Lisan', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 2860, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Tulisan', bold: true, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
          width: { size: 2860, type: WidthType.DXA },
          borders: allBorders,
          margins: cellMargins,
        }),
      ],
    });

    const bahasaDataRows = data.bahasa.map((bhs, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: String(index + 1), font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: bhs.bahasa, font: FONT_NAME, size: FONT_SIZE })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: bhs.kemampuanLisan, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
          new TableCell({
            children: [new Paragraph({ text: bhs.kemampuanTulisan, font: FONT_NAME, size: FONT_SIZE, alignment: AlignmentType.CENTER })],
            borders: allBorders,
            margins: cellMargins,
          }),
        ],
      });
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: [bahasaHeaderRow, ...bahasaDataRows],
      })
    );
  }

  // SECTION 9: REFERENSI
  if (data.referensi && data.referensi.length > 0) {
    sections.push(createSectionTitle('REFERENSI'));
    
    const referensiRows = [];
    data.referensi.forEach((ref, index) => {
      if (index > 0) referensiRows.push(createSeparatorRow());
      
      referensiRows.push(
        createDataRow('Nama', ref.nama),
        createDataRow('Jabatan', ref.jabatan),
        createDataRow('Instansi', ref.instansi),
        createDataRow('No. Telepon', ref.noTelepon)
      );
    });

    sections.push(
      new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        rows: referensiRows,
      })
    );
  }

  // PENUTUP: PERNYATAAN & TANDA TANGAN
  sections.push(
    new Paragraph({
      text: 'Yang bertanda tangan di bawah ini, saya menyatakan bahwa semua keterangan yang tercantum dalam daftar riwayat hidup ini adalah benar dan dapat dipertanggungjawabkan.',
      font: FONT_NAME,
      size: FONT_SIZE,
      spacing: { before: 480, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
    })
  );

  const kotaTanggal = `${data.kotaPenandatangan || 'Jakarta'}, ${formatDate(data.tanggalPenandatangan || new Date())}`;
  
  sections.push(
    new Paragraph({
      text: kotaTanggal,
      font: FONT_NAME,
      size: FONT_SIZE,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: 'Yang Membuat Pernyataan,',
      font: FONT_NAME,
      size: FONT_SIZE,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 960 }, // Space for signature
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.namaLengkap,
          font: FONT_NAME,
          size: FONT_SIZE,
          bold: true,
          underline: {},
        }),
      ],
      alignment: AlignmentType.RIGHT,
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1418, // 2.5cm
              bottom: 1418,
              left: 1701, // 3cm
              right: 1418,
            },
          },
        },
        children: sections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `CV_${data.namaLengkap.replace(/\s+/g, '_')}_${new Date().getFullYear()}.docx`;
  saveAs(blob, fileName);
}
