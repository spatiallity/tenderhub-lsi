import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Btn } from '../UI/index';

export default function AddExpertForm({ onClose, onSave, isSaving }) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    cv: false,
    pendidikan: false,
    pengalaman: false,
    bahasa: false,
  });

  const [formData, setFormData] = useState({
    // Basic (required)
    nama: '',
    instansi: '',
    noHp: '',
    keahlian: '',
    portfolio: 'SDA',
    availability: 'Tersedia',
    
    // CV Data (optional)
    tempatLahir: '',
    tanggalLahir: '',
    agama: '',
    jenisKelamin: 'Laki-laki',
    statusPerkawinan: 'Menikah',
    alamatKTP: '',
    alamatDomisili: '',
    nikKTP: '',
    noNPWP: '',
    kewarganegaraan: 'Indonesia',
    email: '',
    
    // Pendidikan
    pendidikan: [],
    
    // Pengalaman
    pengalamanKerja: [],
    
    // Bahasa
    bahasa: [],
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
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

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.instansi.trim()) {
      alert('Nama dan Instansi wajib diisi!');
      return;
    }

    console.log('Saving expert with data:', formData);

    // Prepare expert data
    const expertData = {
      nama: formData.nama,
      instansi: formData.instansi,
      noHp: formData.noHp,
      keahlian: formData.keahlian ? formData.keahlian.split(',').map(k => k.trim()) : [],
      portfolio: formData.portfolio,
      availability: formData.availability,
      
      // CV data (will be stored for future CV generation)
      cvData: {
        tempatLahir: formData.tempatLahir,
        tanggalLahir: formData.tanggalLahir,
        agama: formData.agama,
        jenisKelamin: formData.jenisKelamin,
        statusPerkawinan: formData.statusPerkawinan,
        alamatKTP: formData.alamatKTP,
        alamatDomisili: formData.alamatDomisili,
        nikKTP: formData.nikKTP,
        noNPWP: formData.noNPWP,
        kewarganegaraan: formData.kewarganegaraan,
        email: formData.email,
        pendidikan: formData.pendidikan,
        pengalamanKerja: formData.pengalamanKerja,
        bahasa: formData.bahasa,
      },
      
      // Convert pengalaman to history format
      history: formData.pengalamanKerja.map(exp => ({
        id: Date.now() + Math.random(), // Unique ID
        proyek: exp.namaProyek || exp.namaInstansi,
        klien: exp.namaInstansi,
        tahun: exp.tanggalSelesai || new Date().getFullYear().toString(),
        peran: exp.posisi,
        nilai: exp.nilaiKontrak || 0,
        bersama: 'Sucofindo',
        status: 'Selesai'
      })),
    };

    console.log('Prepared expert data:', expertData);

    const success = await onSave(expertData);
    console.log('Save result:', success);
  };

  return (
    <div className="border-2 border-blue-100 bg-blue-50/30 rounded-2xl p-6 animate-[slideDown_0.3s_ease-out] mb-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900">Form Tambah Tenaga Ahli</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            <span className="text-red-600 font-bold">*</span> Nama dan Instansi wajib diisi. Data CV opsional.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
        >
          ✕
        </button>
      </div>

      {/* SECTION: BASIC INFO (Required) */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <span>📋 Informasi Dasar (Wajib)</span>
          {expandedSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.basic && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={e => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Nama lengkap"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instansi/Afiliasi <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.instansi}
                onChange={e => setFormData(prev => ({ ...prev, instansi: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Instansi/afiliasi"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. HP</label>
              <input
                type="text"
                value={formData.noHp}
                onChange={e => setFormData(prev => ({ ...prev, noHp: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="No. HP"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keahlian</label>
              <input
                type="text"
                value={formData.keahlian}
                onChange={e => setFormData(prev => ({ ...prev, keahlian: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Pisahkan dengan koma"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio</label>
              <select
                value={formData.portfolio}
                onChange={e => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="SDA">SDA</option>
                <option value="FLP">FLP</option>
                <option value="FITI">FITI</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ketersediaan</label>
              <select
                value={formData.availability}
                onChange={e => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option>Tersedia</option>
                <option>Sedang Bertugas</option>
                <option>Tidak Tersedia</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: CV DATA (Optional) */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('cv')}
          className="w-full flex items-center justify-between p-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          <span>📄 Data CV (Opsional)</span>
          {expandedSections.cv ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.cv && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.tempatLahir}
                onChange={e => setFormData(prev => ({ ...prev, tempatLahir: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={e => setFormData(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan</label>
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
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat KTP</label>
              <textarea
                value={formData.alamatKTP}
                onChange={e => setFormData(prev => ({ ...prev, alamatKTP: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                rows={2}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
              <textarea
                value={formData.alamatDomisili}
                onChange={e => setFormData(prev => ({ ...prev, alamatDomisili: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIK KTP</label>
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
          </div>
        )}
      </div>

      {/* SECTION: PENDIDIKAN (Optional) */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('pendidikan')}
          className="w-full flex items-center justify-between p-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          <span>🎓 Pendidikan (Opsional)</span>
          {expandedSections.pendidikan ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.pendidikan && (
          <div className="mt-3 p-4 bg-white rounded-lg border border-slate-200 space-y-3">
            {formData.pendidikan.map((pend, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Pendidikan #{index + 1}</span>
                  <button
                    onClick={() => removeItem('pendidikan', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={pend.jenjang}
                    onChange={e => updateItem('pendidikan', index, 'jenjang', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option>S3</option>
                    <option>S2</option>
                    <option>S1</option>
                    <option>D4</option>
                    <option>D3</option>
                    <option>SMA</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tahun Lulus"
                    value={pend.tanggalLulus}
                    onChange={e => updateItem('pendidikan', index, 'tanggalLulus', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Fakultas/Jurusan"
                    value={pend.fakultasJurusan}
                    onChange={e => updateItem('pendidikan', index, 'fakultasJurusan', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Nama Perguruan Tinggi"
                    value={pend.namaPerguruanTinggi}
                    onChange={e => updateItem('pendidikan', index, 'namaPerguruanTinggi', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="IPK"
                    value={pend.ipk}
                    onChange={e => updateItem('pendidikan', index, 'ipk', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('pendidikan', { jenjang: 'S1', tanggalLulus: '', fakultasJurusan: '', namaPerguruanTinggi: '', ipk: '' })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Pendidikan
            </button>
          </div>
        )}
      </div>

      {/* SECTION: PENGALAMAN (Optional) */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('pengalaman')}
          className="w-full flex items-center justify-between p-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          <span>💼 Pengalaman Kerja (Opsional)</span>
          {expandedSections.pengalaman ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.pengalaman && (
          <div className="mt-3 p-4 bg-white rounded-lg border border-slate-200 space-y-3">
            {formData.pengalamanKerja.map((exp, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Pengalaman #{index + 1}</span>
                  <button
                    onClick={() => removeItem('pengalamanKerja', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Instansi"
                    value={exp.namaInstansi}
                    onChange={e => updateItem('pengalamanKerja', index, 'namaInstansi', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Nama Proyek"
                    value={exp.namaProyek}
                    onChange={e => updateItem('pengalamanKerja', index, 'namaProyek', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Posisi"
                    value={exp.posisi}
                    onChange={e => updateItem('pengalamanKerja', index, 'posisi', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                  <select
                    value={exp.tingkatWilayah}
                    onChange={e => updateItem('pengalamanKerja', index, 'tingkatWilayah', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
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
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Tanggal Selesai"
                    value={exp.tanggalSelesai}
                    onChange={e => updateItem('pengalamanKerja', index, 'tanggalSelesai', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('pengalamanKerja', { namaInstansi: '', namaProyek: '', posisi: '', tingkatWilayah: 'Nasional', tanggalMulai: '', tanggalSelesai: '', nilaiKontrak: 0 })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Pengalaman
            </button>
          </div>
        )}
      </div>

      {/* SECTION: BAHASA (Optional) */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('bahasa')}
          className="w-full flex items-center justify-between p-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          <span>🌐 Kemampuan Bahasa (Opsional)</span>
          {expandedSections.bahasa ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandedSections.bahasa && (
          <div className="mt-3 p-4 bg-white rounded-lg border border-slate-200 space-y-3">
            {formData.bahasa.map((bhs, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Bahasa #{index + 1}</span>
                  <button
                    onClick={() => removeItem('bahasa', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Bahasa"
                    value={bhs.bahasa}
                    onChange={e => updateItem('bahasa', index, 'bahasa', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                  <select
                    value={bhs.kemampuanLisan}
                    onChange={e => updateItem('bahasa', index, 'kemampuanLisan', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option>Pasif</option>
                    <option>Aktif</option>
                    <option>Sangat Aktif</option>
                  </select>
                  <select
                    value={bhs.kemampuanTulisan}
                    onChange={e => updateItem('bahasa', index, 'kemampuanTulisan', e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option>Pasif</option>
                    <option>Aktif</option>
                    <option>Sangat Aktif</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem('bahasa', { bahasa: '', kemampuanLisan: 'Aktif', kemampuanTulisan: 'Aktif' })}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Bahasa
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 flex gap-2 justify-end border-t border-blue-100 pt-4">
        <Btn className="ghost" onClick={onClose} disabled={isSaving}>
          Batal
        </Btn>
        <Btn className="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan Tenaga Ahli'}
        </Btn>
      </div>
    </div>
  );
}
