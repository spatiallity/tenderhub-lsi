import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

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

// Create table cell with specific styling
const createCell = (text, options = {}) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '-',
            font: 'Times New Roman',
            size: 22, // 11pt
            bold: options.bold || false,
          }),
        ],
        alignment: options.alignment || AlignmentType.LEFT,
      }),
    ],
    width: options.width || { size: 100, type: WidthType.AUTO },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    shading: options.shading || undefined,
  });
};

export const generateCV = async (cvData) => {
  const { dataPribadi, pendidikan, pengalaman, bahasa, expertName } = cvData;

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1417, // 2.5cm
            right: 1417, // 2.5cm
            bottom: 1417, // 2.5cm
            left: 1701, // 3cm
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          text: 'CURRICULUM VITAE',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Data Pribadi Section
        new Paragraph({
          text: 'DATA PRIBADI',
          bold: true,
          font: 'Times New Roman',
          size: 22,
          spacing: { before: 200, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Nama', { width: { size: 30, type: WidthType.PERCENTAGE } }),
                createCell(':', { width: { size: 5, type: WidthType.PERCENTAGE } }),
                createCell(dataPribadi.nama),
              ],
            }),
            new TableRow({
              children: [
                createCell('Tempat/Tanggal Lahir'),
                createCell(':'),
                createCell(`${dataPribadi.tempatLahir}, ${formatDate(dataPribadi.tanggalLahir)}`),
              ],
            }),
            new TableRow({
              children: [
                createCell('Agama'),
                createCell(':'),
                createCell(dataPribadi.agama),
              ],
            }),
            new TableRow({
              children: [
                createCell('Jenis Kelamin'),
                createCell(':'),
                createCell(dataPribadi.jenisKelamin),
              ],
            }),
            new TableRow({
              children: [
                createCell('Status Perkawinan'),
                createCell(':'),
                createCell(dataPribadi.statusPerkawinan),
              ],
            }),
            new TableRow({
              children: [
                createCell('Alamat KTP'),
                createCell(':'),
                createCell(dataPribadi.alamatKTP),
              ],
            }),
            new TableRow({
              children: [
                createCell('Alamat Domisili'),
                createCell(':'),
                createCell(dataPribadi.alamatDomisili),
              ],
            }),
            new TableRow({
              children: [
                createCell('NIK'),
                createCell(':'),
                createCell(dataPribadi.nik),
              ],
            }),
            new TableRow({
              children: [
                createCell('NPWP'),
                createCell(':'),
                createCell(dataPribadi.npwp),
              ],
            }),
            new TableRow({
              children: [
                createCell('Kewarganegaraan'),
                createCell(':'),
                createCell(dataPribadi.kewarganegaraan),
              ],
            }),
            new TableRow({
              children: [
                createCell('No. Telepon'),
                createCell(':'),
                createCell(dataPribadi.noTelepon),
              ],
            }),
            new TableRow({
              children: [
                createCell('Email'),
                createCell(':'),
                createCell(dataPribadi.email),
              ],
            }),
          ],
        }),

        // Pendidikan Section
        new Paragraph({
          text: 'LATAR BELAKANG PENDIDIKAN',
          bold: true,
          font: 'Times New Roman',
          size: 22,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: pendidikan.flatMap((edu, index) => {
            const rows = [
              new TableRow({
                children: [
                  createCell('Jenjang', { width: { size: 30, type: WidthType.PERCENTAGE } }),
                  createCell(':', { width: { size: 5, type: WidthType.PERCENTAGE } }),
                  createCell(edu.jenjang),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tanggal Lulus'),
                  createCell(':'),
                  createCell(formatDate(edu.tanggalLulus)),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Fakultas/Jurusan'),
                  createCell(':'),
                  createCell(edu.fakultasJurusan),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Nama Perguruan Tinggi'),
                  createCell(':'),
                  createCell(edu.namaPerguruanTinggi),
                ],
              }),
              new TableRow({
                children: [
                  createCell('IPK'),
                  createCell(':'),
                  createCell(edu.ipk || '-'),
                ],
              }),
            ];

            // Add separator between education entries
            if (index < pendidikan.length - 1) {
              rows.push(
                new TableRow({
                  children: [
                    createCell('', { 
                      shading: { fill: 'D9D9D9' },
                      width: { size: 30, type: WidthType.PERCENTAGE }
                    }),
                    createCell('', { 
                      shading: { fill: 'D9D9D9' },
                      width: { size: 5, type: WidthType.PERCENTAGE }
                    }),
                    createCell('', { shading: { fill: 'D9D9D9' } }),
                  ],
                })
              );
            }

            return rows;
          }),
        }),

        // Pengalaman Kerja Section
        new Paragraph({
          text: 'RINGKASAN PENGALAMAN KERJA',
          bold: true,
          font: 'Times New Roman',
          size: 22,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header
            new TableRow({
              children: [
                createCell('No', { bold: true, width: { size: 5, type: WidthType.PERCENTAGE } }),
                createCell('Nama Instansi', { bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell('Nama Proyek', { bold: true, width: { size: 30, type: WidthType.PERCENTAGE } }),
                createCell('Posisi', { bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell('Periode', { bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell('Lama Bekerja', { bold: true, width: { size: 10, type: WidthType.PERCENTAGE } }),
              ],
            }),
            // Data rows
            ...pengalaman.map((exp, index) => 
              new TableRow({
                children: [
                  createCell((index + 1).toString()),
                  createCell(exp.namaInstansi),
                  createCell(exp.namaProyek),
                  createCell(exp.posisi),
                  createCell(`${formatDate(exp.periodeAwal)} - ${formatDate(exp.periodeAkhir)}`),
                  createCell(calculateDuration(exp.periodeAwal, exp.periodeAkhir)),
                ],
              })
            ),
          ],
        }),

        // Uraian Pengalaman Kerja
        new Paragraph({
          text: 'URAIAN PENGALAMAN KERJA',
          bold: true,
          font: 'Times New Roman',
          size: 22,
          spacing: { before: 400, after: 200 },
        }),

        ...pengalaman.flatMap((exp, index) => [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Nama Instansi', { width: { size: 30, type: WidthType.PERCENTAGE } }),
                  createCell(':', { width: { size: 5, type: WidthType.PERCENTAGE } }),
                  createCell(exp.namaInstansi),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Nama Proyek'),
                  createCell(':'),
                  createCell(exp.namaProyek),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Posisi'),
                  createCell(':'),
                  createCell(exp.posisi),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tingkat Wilayah'),
                  createCell(':'),
                  createCell(exp.tingkatWilayah || '-'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Periode Kerja'),
                  createCell(':'),
                  createCell(`${formatDate(exp.periodeAwal)} - ${formatDate(exp.periodeAkhir)}`),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Lama Bekerja'),
                  createCell(':'),
                  createCell(calculateDuration(exp.periodeAwal, exp.periodeAkhir)),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Nilai Kontrak'),
                  createCell(':'),
                  createCell(formatRupiah(exp.nilaiKontrak)),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Uraian Tugas'),
                  createCell(':'),
                  createCell(exp.uraianTugas || '-'),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
        ]),

        // Kemampuan Bahasa
        new Paragraph({
          text: 'KEMAMPUAN BAHASA',
          bold: true,
          font: 'Times New Roman',
          size: 22,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header
            new TableRow({
              children: [
                createCell('No', { bold: true, width: { size: 10, type: WidthType.PERCENTAGE } }),
                createCell('Nama Bahasa', { bold: true, width: { size: 30, type: WidthType.PERCENTAGE } }),
                createCell('Kemampuan Lisan', { bold: true, width: { size: 30, type: WidthType.PERCENTAGE } }),
                createCell('Kemampuan Tulisan', { bold: true, width: { size: 30, type: WidthType.PERCENTAGE } }),
              ],
            }),
            // Data rows
            ...bahasa.map((lang, index) => 
              new TableRow({
                children: [
                  createCell((index + 1).toString()),
                  createCell(lang.namaBahasa),
                  createCell(lang.kemampuanLisan),
                  createCell(lang.kemampuanTulisan),
                ],
              })
            ),
          ],
        }),

        // Pernyataan
        new Paragraph({
          text: '',
          spacing: { before: 400 },
        }),
        new Paragraph({
          text: 'Demikian curriculum vitae ini saya buat dengan sebenarnya.',
          font: 'Times New Roman',
          size: 22,
        }),
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: `${dataPribadi.tempatLahir}, ${formatDate(new Date())}`,
          font: 'Times New Roman',
          size: 22,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: '',
          spacing: { after: 800 },
        }),
        new Paragraph({
          text: dataPribadi.nama,
          font: 'Times New Roman',
          size: 22,
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `CV_${expertName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.docx`;
  saveAs(blob, fileName);
};
