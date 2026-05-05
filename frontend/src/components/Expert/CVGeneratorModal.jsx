import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Download, FileDown } from 'lucide-react';
import { generateCV } from '../../utils/cvGenerator';
import { generateCVPDF } from '../../utils/cvGeneratorPDF';

export default function CVGeneratorModal({ expert, onClose }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pribadi');
  const [outputFormat, setOutputFormat] = useState('docx'); // 'docx' or 'pdf'
  
  // Initialize with expert data
  const [formData, setFormData] = useState({
    // Data Pribadi
    namaLengkap: expert?.nama || '',
    tempatLahir: expert?.cvData?.tempatLahir || '',
    tanggalLahir: expert?.cvData?.tanggalLahir || '',
    agama: expert?.cvData?.agama || '',
    jenisKelamin: expert?.cvData?.jenisKelamin || 'Laki-laki',
    statusPerkawinan: expert?.cvData?.statusPerkawinan || 'Menikah',
    alamatKTP: expert?.cvData?.alamatKTP || '',
    alamatDomisili: expert?.cvData?.alamatDomisili || '',
    nikKTP: expert?.cvData?.nikKTP || '',
    noNPWP: expert?.cvData?.noNPWP || '',
    kewarganegaraan: expert?.cvData?.kewarganegaraan || 'Indonesia',
    noTelepon: expert?.noHp || '',
    email: expert?.cvData?.email || '',
    
    // Pendidikan
    pendidikan: expert?.cvData?.pendidikan || [
      { jenjang: 'S1', tanggalLulus: '', fakultasJurusan: '', namaPerguruanTinggi: '', ipk: '' }
    ],
    
    // Pengalaman Kerja (from expert history or cvData)
    pengalamanKerja: expert?.cvData?.pengalamanKerja || (expert?.history || []).map(h => ({
      namaInstansi: h.klien || '',
      namaProyek: h.proyek || '',
      posisi: h.peran || '',
      tingkatWilayah: 'Nasional',
      tanggalMulai: '',
      tanggalSelesai: h.tahun || '',
      lamaBekerjaTahun: 0,
      lamaBekerjaBulan: 0,
      nilaiKontrak: h.nilai || 0,
      uraianTugas: ''
    })),
    
    // Sertifikasi
    sertifikasi: expert?.cvData?.sertifikasi || [],
    
    // Pelatihan
    pelatihan: expert?.cvData?.pelatihan || [],
    
    // Organisasi
    organisasi: expert?.cvData?.organisasi || [],
    
    // Bahasa
    bahasa: expert?.cvData?.bahasa || [
      { bahasa: 'Indonesia', kemampuanLisan: 'Sangat Aktif', kemampuanTulisan: 'Sangat Aktif' }
    ],
    
    // Referensi
    referensi: expert?.cvData?.referensi || [],
    
    // Penutup
    kotaPenandatangan: 'Jakarta',
    tanggalPenandatangan: new Date().toISOString().split('T')[0],
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (outputFormat === 'pdf') {
        await generateCVPDF(formData);
        alert('CV PDF berhasil di-generate! File akan diunduh otomatis.');
      } else {
        await generateCV(formData);
        alert('CV DOCX berhasil di-generate! File akan diunduh otomatis.');
      }
    } catch (error) {
      console.error('Error generating CV:', error);
      alert('Gagal generate CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field) => {
    const templates = {
      pendidikan: { jenjang: 'S1', tanggalLulus: '', fakultasJurusan: '', namaPerguruanTinggi: '', ipk: '' },
      pengalamanKerja: { namaInstansi: '', namaProyek: '', posisi: '', tingkatWilayah: 'Nasional', tanggalMulai: '', tanggalSelesai: '', lamaBekerjaTahun: 0, lamaBekerjaBulan: 0, nilaiKontrak: 0, uraianTugas: '' },
      sertifikasi: { bidang: '', namaSertifikat: '', nomorSertifikat: '', lembagaPenerbit: '', tahunTerbit: '', masaBerlaku: '' },
      pelatihan: { namaPelatihan: '', penyelenggara: '', tahun: '', durasi: '' },
      organisasi: { namaOrganisasi: '', jabatan: '', tahunMasuk: '' },
      bahasa: { bahasa: '', kemampuanLisan: 'Aktif', kemampuanTulisan: 'Aktif' },
      referensi: { nama: '', jabatan: '', instansi: '', noTelepon: '' },
    };
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], templates[field]]
    }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const tabs = [
    { id: 'pribadi', label: 'Data Pribadi' },
    { id: 'pendidikan', label: 'Pendidikan' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'sertifikasi', label: 'Sertifikasi' },
    { id: 'pelatihan', label: 'Pelatihan' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'bahasa', label: 'Bahasa' },
    { id: 'referensi', label: 'Referensi' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Generator CV Tenaga Ahli</h2>
              <p className="text-sm text-slate-500">Format resmi pengadaan pemerintah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* DATA PRIBADI */}
          {activeTab === 'pribadi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.namaLengkap}
                  onChange={e => setFormData(prev => ({ ...prev, namaLengkap: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={e => setFormData(prev => ({ ...prev, tempatLahir: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={e => setFormData(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agama *</label>
                <select
                  value={formData.agama}
                  onChange={e => setFormData(prev => ({ ...prev, agama: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Pilih Agama</option>
                  <option>Islam</option>
                  <option>Kristen</option>
                  <option>Katolik</option>
                  <option>Hindu</option>
                  <option>Buddha</option>
                  <option>Konghucu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={e => setFormData(prev => ({ ...prev, jenisKelamin: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan *</label>
                <select
                  value={formData.statusPerkawinan}
                  onChange={e => setFormData(prev => ({ ...prev, statusPerkawinan: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option>Menikah</option>
                  <option>Belum Menikah</option>
                  <option>Cerai</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat KTP *</label>
                <textarea
                  value={formData.alamatKTP}
                  onChange={e => setFormData(prev => ({ ...prev, alamatKTP: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili *</label>
                <textarea
                  value={formData.alamatDomisili}
                  onChange={e => setFormData(prev => ({ ...prev, alamatDomisili: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIK KTP *</label>
                <input
                  type="text"
                  value={formData.nikKTP}
                  onChange={e => setFormData(prev => ({ ...prev, nikKTP: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  maxLength={16}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. NPWP</label>
                <input
                  type="text"
                  value={formData.noNPWP}
                  onChange={e => setFormData(prev => ({ ...prev, noNPWP: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon/HP *</label>
                <input
                  type="text"
                  value={formData.noTelepon}
                  onChange={e => setFormData(prev => ({ ...prev, noTelepon: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          )}

          {/* PENDIDIKAN */}
          {activeTab === 'pendidikan' && (
            <div className="space-y-4">
              {formData.pendidikan.map((pend, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Pendidikan #{index + 1}</h3>
                    <button
                      onClick={() => removeItem('pendidikan', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={pend.jenjang}
                      onChange={e => updateItem('pendidikan', index, 'jenjang', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option>S3</option>
                      <option>S2</option>
                      <option>S1</option>
                      <option>D4</option>
                      <option>D3</option>
                      <option>SMA</option>
                      <option>SMK</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tanggal Lulus"
                      value={pend.tanggalLulus}
                      onChange={e => updateItem('pendidikan', index, 'tanggalLulus', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Fakultas/Jurusan"
                      value={pend.fakultasJurusan}
                      onChange={e => updateItem('pendidikan', index, 'fakultasJurusan', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Nama Perguruan Tinggi"
                      value={pend.namaPerguruanTinggi}
                      onChange={e => updateItem('pendidikan', index, 'namaPerguruanTinggi', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="IPK"
                      value={pend.ipk}
                      onChange={e => updateItem('pendidikan', index, 'ipk', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('pendidikan')}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Tambah Pendidikan
              </button>
            </div>
          )}

          {/* PENGALAMAN KERJA */}
          {activeTab === 'pengalaman' && (
            <div className="space-y-4">
              {formData.pengalamanKerja.map((exp, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Pengalaman #{index + 1}</h3>
                    <button
                      onClick={() => removeItem('pengalamanKerja', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nama Instansi"
                      value={exp.namaInstansi}
                      onChange={e => updateItem('pengalamanKerja', index, 'namaInstansi', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Nama Proyek"
                      value={exp.namaProyek}
                      onChange={e => updateItem('pengalamanKerja', index, 'namaProyek', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Posisi/Jabatan"
                      value={exp.posisi}
                      onChange={e => updateItem('pengalamanKerja', index, 'posisi', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <select
                      value={exp.tingkatWilayah}
                      onChange={e => updateItem('pengalamanKerja', index, 'tingkatWilayah', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option>Nasional</option>
                      <option>Provinsi</option>
                      <option>Kabupaten/Kota</option>
                    </select>
                    <input
                      type="date"
                      placeholder="Tanggal Mulai"
                      value={exp.tanggalMulai}
                      onChange={e => updateItem('pengalamanKerja', index, 'tanggalMulai', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Tanggal Selesai (atau 'Sekarang')"
                      value={exp.tanggalSelesai}
                      onChange={e => updateItem('pengalamanKerja', index, 'tanggalSelesai', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Lama Bekerja (Tahun)"
                      value={exp.lamaBekerjaTahun}
                      onChange={e => updateItem('pengalamanKerja', index, 'lamaBekerjaTahun', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Lama Bekerja (Bulan)"
                      value={exp.lamaBekerjaBulan}
                      onChange={e => updateItem('pengalamanKerja', index, 'lamaBekerjaBulan', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Nilai Kontrak (Rp)"
                      value={exp.nilaiKontrak}
                      onChange={e => updateItem('pengalamanKerja', index, 'nilaiKontrak', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                    />
                    <textarea
                      placeholder="Uraian Tugas"
                      value={exp.uraianTugas}
                      onChange={e => updateItem('pengalamanKerja', index, 'uraianTugas', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white col-span-2"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('pengalamanKerja')}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Tambah Pengalaman
              </button>
            </div>
          )}

          {/* Simplified tabs for other sections */}
          {activeTab === 'sertifikasi' && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Fitur sertifikasi akan ditambahkan di versi berikutnya.</p>
              <p className="text-xs mt-2">Untuk saat ini, Anda bisa generate CV dengan data yang sudah diisi.</p>
            </div>
          )}
          
          {activeTab === 'pelatihan' && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Fitur pelatihan akan ditambahkan di versi berikutnya.</p>
            </div>
          )}
          
          {activeTab === 'organisasi' && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Fitur organisasi akan ditambahkan di versi berikutnya.</p>
            </div>
          )}
          
          {activeTab === 'bahasa' && (
            <div className="space-y-4">
              {formData.bahasa.map((bhs, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Bahasa #{index + 1}</h3>
                    <button
                      onClick={() => removeItem('bahasa', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nama Bahasa"
                      value={bhs.bahasa}
                      onChange={e => updateItem('bahasa', index, 'bahasa', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                    <select
                      value={bhs.kemampuanLisan}
                      onChange={e => updateItem('bahasa', index, 'kemampuanLisan', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option>Pasif</option>
                      <option>Aktif</option>
                      <option>Sangat Aktif</option>
                    </select>
                    <select
                      value={bhs.kemampuanTulisan}
                      onChange={e => updateItem('bahasa', index, 'kemampuanTulisan', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option>Pasif</option>
                      <option>Aktif</option>
                      <option>Sangat Aktif</option>
                    </select>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('bahasa')}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Tambah Bahasa
              </button>
            </div>
          )}
          
          {activeTab === 'referensi' && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Fitur referensi akan ditambahkan di versi berikutnya.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500">
              * Field wajib diisi untuk generate CV
            </p>
            
            {/* Format Selector */}
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span className="text-xs font-bold text-slate-700">Format:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOutputFormat('docx')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    outputFormat === 'docx'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-300 hover:border-blue-500'
                  }`}
                >
                  <FileText size={14} />
                  DOCX
                </button>
                <button
                  onClick={() => setOutputFormat('pdf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    outputFormat === 'pdf'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-300 hover:border-red-500'
                  }`}
                >
                  <FileDown size={14} />
                  PDF
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                outputFormat === 'pdf'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate {outputFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
