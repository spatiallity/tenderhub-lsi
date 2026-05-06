import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { generateCV } from '../../utils/cvGenerator';
import { generateCVPDF } from '../../utils/cvGeneratorPDF';

const CVGeneratorModal = ({ expert, onClose }) => {
  const [activeTab, setActiveTab] = useState('pribadi');
  const [outputFormat, setOutputFormat] = useState('docx'); // 'docx' or 'pdf'
  
  // Form state
  const [dataPribadi, setDataPribadi] = useState({
    nama: expert?.nama || '',
    tempatLahir: '',
    tanggalLahir: '',
    agama: '',
    jenisKelamin: 'Laki-laki',
    statusPerkawinan: 'Belum Menikah',
    alamatKTP: '',
    alamatDomisili: '',
    nik: '',
    npwp: '',
    kewarganegaraan: 'Indonesia',
    noTelepon: expert?.no_hp || '',
    email: '',
  });

  const [pendidikan, setPendidikan] = useState([
    {
      jenjang: 'S1',
      tanggalLulus: '',
      fakultasJurusan: '',
      namaPerguruanTinggi: '',
      ipk: '',
    },
  ]);

  const [pengalaman, setPengalaman] = useState(
    expert?.history?.map(h => ({
      namaInstansi: h.klien || '',
      namaProyek: h.proyek || '',
      posisi: h.peran || 'Tenaga Ahli',
      tingkatWilayah: 'Nasional',
      periodeAwal: `${h.tahun}-01-01`,
      periodeAkhir: `${h.tahun}-12-31`,
      nilaiKontrak: h.nilai || 0,
      uraianTugas: '',
    })) || []
  );

  const [bahasa, setBahasa] = useState([
    {
      namaBahasa: 'Indonesia',
      kemampuanLisan: 'Sangat Aktif',
      kemampuanTulisan: 'Sangat Aktif',
    },
  ]);

  const tabs = [
    { id: 'pribadi', label: 'Data Pribadi' },
    { id: 'pendidikan', label: 'Pendidikan' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'bahasa', label: 'Bahasa' },
  ];

  const handleGenerate = async () => {
    const cvData = {
      dataPribadi,
      pendidikan,
      pengalaman,
      bahasa,
      expertName: expert.nama,
    };

    try {
      if (outputFormat === 'docx') {
        await generateCV(cvData);
      } else {
        generateCVPDF(cvData);
      }
    } catch (error) {
      console.error('Error generating CV:', error);
      alert('Gagal generate CV. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold">Generate CV</h2>
              <p className="text-sm text-slate-500">{expert?.nama}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'pribadi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dataPribadi.nama}
                    onChange={e => setDataPribadi({ ...dataPribadi, nama: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dataPribadi.tempatLahir}
                    onChange={e => setDataPribadi({ ...dataPribadi, tempatLahir: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataPribadi.tanggalLahir}
                    onChange={e => setDataPribadi({ ...dataPribadi, tanggalLahir: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Agama <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dataPribadi.agama}
                    onChange={e => setDataPribadi({ ...dataPribadi, agama: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Pilih Agama</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dataPribadi.jenisKelamin}
                    onChange={e => setDataPribadi({ ...dataPribadi, jenisKelamin: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status Perkawinan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dataPribadi.statusPerkawinan}
                    onChange={e => setDataPribadi({ ...dataPribadi, statusPerkawinan: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai">Cerai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat KTP <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={dataPribadi.alamatKTP}
                  onChange={e => setDataPribadi({ ...dataPribadi, alamatKTP: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Domisili <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={dataPribadi.alamatDomisili}
                  onChange={e => setDataPribadi({ ...dataPribadi, alamatDomisili: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dataPribadi.nik}
                    onChange={e => setDataPribadi({ ...dataPribadi, nik: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    NPWP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dataPribadi.npwp}
                    onChange={e => setDataPribadi({ ...dataPribadi, npwp: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    No. Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={dataPribadi.noTelepon}
                    onChange={e => setDataPribadi({ ...dataPribadi, noTelepon: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={dataPribadi.email}
                    onChange={e => setDataPribadi({ ...dataPribadi, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pendidikan' && (
            <div className="space-y-4">
              {pendidikan.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Pendidikan #{index + 1}</h3>
                    {pendidikan.length > 1 && (
                      <button
                        onClick={() => setPendidikan(pendidikan.filter((_, i) => i !== index))}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenjang</label>
                      <select
                        value={edu.jenjang}
                        onChange={e => {
                          const newPendidikan = [...pendidikan];
                          newPendidikan[index].jenjang = e.target.value;
                          setPendidikan(newPendidikan);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="S3">S3</option>
                        <option value="S2">S2</option>
                        <option value="S1">S1</option>
                        <option value="D4">D4</option>
                        <option value="D3">D3</option>
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Lulus</label>
                      <input
                        type="date"
                        value={edu.tanggalLulus}
                        onChange={e => {
                          const newPendidikan = [...pendidikan];
                          newPendidikan[index].tanggalLulus = e.target.value;
                          setPendidikan(newPendidikan);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fakultas/Jurusan</label>
                      <input
                        type="text"
                        value={edu.fakultasJurusan}
                        onChange={e => {
                          const newPendidikan = [...pendidikan];
                          newPendidikan[index].fakultasJurusan = e.target.value;
                          setPendidikan(newPendidikan);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Perguruan Tinggi</label>
                      <input
                        type="text"
                        value={edu.namaPerguruanTinggi}
                        onChange={e => {
                          const newPendidikan = [...pendidikan];
                          newPendidikan[index].namaPerguruanTinggi = e.target.value;
                          setPendidikan(newPendidikan);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IPK</label>
                      <input
                        type="text"
                        value={edu.ipk}
                        onChange={e => {
                          const newPendidikan = [...pendidikan];
                          newPendidikan[index].ipk = e.target.value;
                          setPendidikan(newPendidikan);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="3.50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setPendidikan([...pendidikan, {
                  jenjang: 'S1',
                  tanggalLulus: '',
                  fakultasJurusan: '',
                  namaPerguruanTinggi: '',
                  ipk: '',
                }])}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg py-3 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Tambah Pendidikan
              </button>
            </div>
          )}

          {activeTab === 'pengalaman' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Data pengalaman sudah diisi otomatis dari riwayat proyek. Anda bisa mengedit atau menambah pengalaman baru.
              </p>
              {pengalaman.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Pengalaman #{index + 1}</h3>
                    <button
                      onClick={() => setPengalaman(pengalaman.filter((_, i) => i !== index))}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Instansi</label>
                      <input
                        type="text"
                        value={exp.namaInstansi}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].namaInstansi = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Proyek</label>
                      <input
                        type="text"
                        value={exp.namaProyek}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].namaProyek = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Posisi</label>
                      <input
                        type="text"
                        value={exp.posisi}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].posisi = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tingkat Wilayah</label>
                      <select
                        value={exp.tingkatWilayah}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].tingkatWilayah = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="Internasional">Internasional</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Provinsi">Provinsi</option>
                        <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Periode Awal</label>
                      <input
                        type="date"
                        value={exp.periodeAwal}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].periodeAwal = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Periode Akhir</label>
                      <input
                        type="date"
                        value={exp.periodeAkhir}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].periodeAkhir = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Nilai Kontrak (Rp)</label>
                      <input
                        type="number"
                        value={exp.nilaiKontrak}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].nilaiKontrak = Number(e.target.value);
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Uraian Tugas</label>
                      <textarea
                        value={exp.uraianTugas}
                        onChange={e => {
                          const newPengalaman = [...pengalaman];
                          newPengalaman[index].uraianTugas = e.target.value;
                          setPengalaman(newPengalaman);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setPengalaman([...pengalaman, {
                  namaInstansi: '',
                  namaProyek: '',
                  posisi: 'Tenaga Ahli',
                  tingkatWilayah: 'Nasional',
                  periodeAwal: '',
                  periodeAkhir: '',
                  nilaiKontrak: 0,
                  uraianTugas: '',
                }])}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg py-3 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Tambah Pengalaman
              </button>
            </div>
          )}

          {activeTab === 'bahasa' && (
            <div className="space-y-4">
              {bahasa.map((lang, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Bahasa #{index + 1}</h3>
                    {bahasa.length > 1 && (
                      <button
                        onClick={() => setBahasa(bahasa.filter((_, i) => i !== index))}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Bahasa</label>
                      <input
                        type="text"
                        value={lang.namaBahasa}
                        onChange={e => {
                          const newBahasa = [...bahasa];
                          newBahasa[index].namaBahasa = e.target.value;
                          setBahasa(newBahasa);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kemampuan Lisan</label>
                      <select
                        value={lang.kemampuanLisan}
                        onChange={e => {
                          const newBahasa = [...bahasa];
                          newBahasa[index].kemampuanLisan = e.target.value;
                          setBahasa(newBahasa);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="Pasif">Pasif</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Sangat Aktif">Sangat Aktif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kemampuan Tulisan</label>
                      <select
                        value={lang.kemampuanTulisan}
                        onChange={e => {
                          const newBahasa = [...bahasa];
                          newBahasa[index].kemampuanTulisan = e.target.value;
                          setBahasa(newBahasa);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="Pasif">Pasif</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Sangat Aktif">Sangat Aktif</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setBahasa([...bahasa, {
                  namaBahasa: '',
                  kemampuanLisan: 'Aktif',
                  kemampuanTulisan: 'Aktif',
                }])}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg py-3 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Tambah Bahasa
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Format Output:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setOutputFormat('docx')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  outputFormat === 'docx'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📄 DOCX (Editable)
              </button>
              <button
                onClick={() => setOutputFormat('pdf')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  outputFormat === 'pdf'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📕 PDF (Print-Ready)
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors ${
                outputFormat === 'docx'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Download size={18} />
              Generate {outputFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVGeneratorModal;
