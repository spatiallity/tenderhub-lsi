"""
Complete ALL expert data with full CV information
- Personal data (tempat_lahir, tanggal_lahir, posisi_diusulkan)
- Education (pendidikan_formal, pendidikan_non_formal)
- Language skills (penguasaan_bahasa)
- Add more projects with complete CV template fields
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def get_all_experts():
    """Get all experts from database"""
    response = requests.get(f"{BASE_URL}/experts")
    response.raise_for_status()
    return response.json()

def update_expert_profile(expert_id, data):
    """Update expert profile data"""
    response = requests.patch(f"{BASE_URL}/experts/{expert_id}", json=data)
    response.raise_for_status()
    return response.json()

def add_project_to_expert(expert_id, project_data):
    """Add a project to expert"""
    response = requests.post(f"{BASE_URL}/experts/{expert_id}/projects", json=project_data)
    response.raise_for_status()
    return response.json()

# Complete data for each expert
EXPERT_COMPLETE_DATA = {
    # Expert profiles with complete personal and education data
    "profiles": [
        {
            "nama_contains": "Budi Santoso",
            "tempat_lahir": "Bandung",
            "tanggal_lahir": "15 Maret 1975",
            "posisi_diusulkan": "Team Leader",
            "pendidikan_formal": [
                "S3 Teknik Geologi, Institut Teknologi Bandung (2005)",
                "S2 Teknik Pertambangan, Institut Teknologi Bandung (2000)",
                "S1 Teknik Geologi, Universitas Padjadjaran (1997)"
            ],
            "pendidikan_non_formal": [
                "Sertifikasi Project Management Professional (PMP), PMI (2010)",
                "Training Advanced Geological Mapping, USGS (2008)",
                "Workshop Environmental Impact Assessment, AMDAL (2006)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Mandarin: Cukup"
            ]
        },
        {
            "nama_contains": "Siti Rahayu",
            "tempat_lahir": "Yogyakarta",
            "tanggal_lahir": "22 Juli 1970",
            "posisi_diusulkan": "Senior Expert",
            "pendidikan_formal": [
                "S3 Teknik Lingkungan, Institut Teknologi Bandung (2003)",
                "S2 Teknik Lingkungan, Universitas Gadjah Mada (1998)",
                "S1 Teknik Kimia, Universitas Gadjah Mada (1993)"
            ],
            "pendidikan_non_formal": [
                "Certified Environmental Auditor, ISO 14001 (2012)",
                "Training Waste Management Systems, JICA (2009)",
                "Workshop Climate Change Adaptation, UNDP (2015)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Jepang: Baik"
            ]
        },
        {
            "nama_contains": "Andi Wijaya",
            "tempat_lahir": "Surabaya",
            "tanggal_lahir": "10 Januari 1980",
            "posisi_diusulkan": "Technical Specialist",
            "pendidikan_formal": [
                "S2 Teknik Sipil, Institut Teknologi Sepuluh Nopember (2008)",
                "S1 Teknik Sipil, Universitas Brawijaya (2003)"
            ],
            "pendidikan_non_formal": [
                "Sertifikasi Ahli K3 Konstruksi, Kemnaker (2010)",
                "Training Bridge Design and Analysis, ASCE (2011)",
                "Workshop BIM Implementation, Autodesk (2018)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Belanda: Cukup"
            ]
        },
        {
            "nama_contains": "Hendra Kusuma",
            "tempat_lahir": "Jakarta",
            "tanggal_lahir": "5 September 1978",
            "posisi_diusulkan": "Project Manager",
            "pendidikan_formal": [
                "S3 Manajemen Proyek, Universitas Indonesia (2012)",
                "S2 Teknik Industri, Institut Teknologi Bandung (2005)",
                "S1 Teknik Mesin, Universitas Indonesia (2000)"
            ],
            "pendidikan_non_formal": [
                "Certified Scrum Master (CSM), Scrum Alliance (2016)",
                "Training Risk Management, PMI (2013)",
                "Workshop Agile Project Management, ICAgile (2017)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Prancis: Baik"
            ]
        },
        {
            "nama_contains": "Maya Sari",
            "tempat_lahir": "Medan",
            "tanggal_lahir": "18 April 1982",
            "posisi_diusulkan": "Quality Assurance Specialist",
            "pendidikan_formal": [
                "S2 Teknik Kimia, Universitas Gadjah Mada (2009)",
                "S1 Teknik Kimia, Universitas Sumatera Utara (2004)"
            ],
            "pendidikan_non_formal": [
                "Certified Quality Engineer (CQE), ASQ (2014)",
                "Training ISO 9001:2015 Lead Auditor, BSI (2016)",
                "Workshop Six Sigma Green Belt, IASSC (2015)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Malaysia: Baik"
            ]
        },
        {
            "nama_contains": "Lestari Wulandari",
            "tempat_lahir": "Semarang",
            "tanggal_lahir": "12 November 1976",
            "posisi_diusulkan": "Health Survey Expert",
            "pendidikan_formal": [
                "S2 Kesehatan Masyarakat, Universitas Gadjah Mada (2005)",
                "S1 Gizi, Universitas Diponegoro (2000)"
            ],
            "pendidikan_non_formal": [
                "Training Nutritional Survey Methods, WHO (2010)",
                "Workshop Data Analysis with SPSS, IBM (2012)",
                "Certified Health Education Specialist (CHES), NCHEC (2015)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik"
            ]
        },
        {
            "nama_contains": "Ahmad Fauzi",
            "tempat_lahir": "Palembang",
            "tanggal_lahir": "25 Februari 1979",
            "posisi_diusulkan": "IT Infrastructure Specialist",
            "pendidikan_formal": [
                "S2 Teknik Informatika, Institut Teknologi Bandung (2007)",
                "S1 Teknik Elektro, Universitas Sriwijaya (2002)"
            ],
            "pendidikan_non_formal": [
                "Cisco Certified Network Professional (CCNP), Cisco (2013)",
                "Training Cloud Architecture, AWS (2018)",
                "Workshop Cybersecurity Fundamentals, CompTIA (2019)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik"
            ]
        },
        {
            "nama_contains": "Dewi Kartika",
            "tempat_lahir": "Denpasar",
            "tanggal_lahir": "8 Juni 1983",
            "posisi_diusulkan": "Environmental Consultant",
            "pendidikan_formal": [
                "S2 Ilmu Lingkungan, Universitas Indonesia (2010)",
                "S1 Biologi, Universitas Udayana (2005)"
            ],
            "pendidikan_non_formal": [
                "Training Environmental Impact Assessment, AMDAL (2011)",
                "Workshop Marine Conservation, WWF (2014)",
                "Certified Environmental Professional (CEP), NAEP (2016)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Bali: Sangat Baik"
            ]
        },
        {
            "nama_contains": "Rudi Hartono",
            "tempat_lahir": "Makassar",
            "tanggal_lahir": "30 Agustus 1977",
            "posisi_diusulkan": "Marine Engineering Expert",
            "pendidikan_formal": [
                "S2 Teknik Kelautan, Institut Teknologi Sepuluh Nopember (2006)",
                "S1 Teknik Perkapalan, Universitas Hasanuddin (2001)"
            ],
            "pendidikan_non_formal": [
                "Training Offshore Structure Design, DNV GL (2012)",
                "Workshop Port and Harbor Engineering, PIANC (2014)",
                "Certified Marine Surveyor, IIMS (2015)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Bugis: Sangat Baik"
            ]
        },
        {
            "nama_contains": "Fitri Handayani",
            "tempat_lahir": "Padang",
            "tanggal_lahir": "14 Desember 1981",
            "posisi_diusulkan": "Social Development Specialist",
            "pendidikan_formal": [
                "S2 Sosiologi, Universitas Indonesia (2008)",
                "S1 Antropologi, Universitas Andalas (2003)"
            ],
            "pendidikan_non_formal": [
                "Training Participatory Rural Appraisal, World Bank (2010)",
                "Workshop Gender Mainstreaming, UN Women (2013)",
                "Certified Social Impact Assessment Professional, IAIA (2015)"
            ],
            "penguasaan_bahasa": [
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Minang: Sangat Baik"
            ]
        }
    ]
}

# Additional projects for experts (to demonstrate dynamic CV generation)
ADDITIONAL_PROJECTS = [
    {
        "expert_name_contains": "Budi Santoso",
        "projects": [
            {
                "nama_proyek": "Studi Kelayakan Tambang Emas Martabe",
                "pemberi_kerja": "PT Agincourt Resources",
                "lokasi_proyek": "Kabupaten Tapanuli Selatan, Sumatera Utara",
                "pengguna_jasa": "PT Agincourt Resources",
                "uraian_tugas": "Melakukan kajian geologi regional, pemetaan detail struktur geologi, analisis cadangan mineral, dan penyusunan laporan kelayakan tambang sesuai standar JORC",
                "waktu_mulai": "Januari 2023",
                "waktu_selesai": "Juni 2023",
                "posisi_penugasan": "Senior Geologist",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/AGR/2023/045",
                "tahun": 2023,
                "nilai_proyek": 850000000,
                "peran": "Senior Geologist",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            },
            {
                "nama_proyek": "Audit Lingkungan Tambang Batubara Kalimantan",
                "pemberi_kerja": "PT Adaro Energy",
                "lokasi_proyek": "Kabupaten Tabalong, Kalimantan Selatan",
                "pengguna_jasa": "PT Adaro Energy Tbk",
                "uraian_tugas": "Melaksanakan audit lingkungan komprehensif, evaluasi sistem pengelolaan lingkungan, pemeriksaan kepatuhan terhadap peraturan, dan penyusunan rekomendasi perbaikan",
                "waktu_mulai": "Agustus 2022",
                "waktu_selesai": "November 2022",
                "posisi_penugasan": "Lead Environmental Auditor",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/ADE/2022/128",
                "tahun": 2022,
                "nilai_proyek": 650000000,
                "peran": "Lead Environmental Auditor",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            }
        ]
    },
    {
        "expert_name_contains": "Siti Rahayu",
        "projects": [
            {
                "nama_proyek": "Penyusunan Dokumen AMDAL Pabrik Petrokimia",
                "pemberi_kerja": "PT Chandra Asri Petrochemical",
                "lokasi_proyek": "Cilegon, Banten",
                "pengguna_jasa": "PT Chandra Asri Petrochemical Tbk",
                "uraian_tugas": "Menyusun dokumen AMDAL lengkap meliputi ANDAL, RKL, dan RPL untuk pembangunan pabrik petrokimia, koordinasi dengan stakeholder, dan presentasi di komisi AMDAL",
                "waktu_mulai": "Maret 2023",
                "waktu_selesai": "September 2023",
                "posisi_penugasan": "AMDAL Team Leader",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/CAP/2023/067",
                "tahun": 2023,
                "nilai_proyek": 1200000000,
                "peran": "AMDAL Team Leader",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            },
            {
                "nama_proyek": "Audit ISO 14001 Industri Manufaktur",
                "pemberi_kerja": "PT Astra Honda Motor",
                "lokasi_proyek": "Karawang, Jawa Barat",
                "pengguna_jasa": "PT Astra Honda Motor",
                "uraian_tugas": "Melakukan audit sistem manajemen lingkungan ISO 14001:2015, verifikasi implementasi prosedur, evaluasi kinerja lingkungan, dan penyusunan laporan audit",
                "waktu_mulai": "Januari 2024",
                "waktu_selesai": "Februari 2024",
                "posisi_penugasan": "Lead Auditor ISO 14001",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/AHM/2024/012",
                "tahun": 2024,
                "nilai_proyek": 350000000,
                "peran": "Lead Auditor",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            }
        ]
    },
    {
        "expert_name_contains": "Andi Wijaya",
        "projects": [
            {
                "nama_proyek": "Supervisi Pembangunan Jembatan Tol Trans Jawa",
                "pemberi_kerja": "PT Jasa Marga (Persero) Tbk",
                "lokasi_proyek": "Semarang - Solo, Jawa Tengah",
                "pengguna_jasa": "PT Jasa Marga (Persero) Tbk",
                "uraian_tugas": "Melakukan supervisi konstruksi jembatan, pemeriksaan kualitas material, monitoring progress pekerjaan, review shop drawing, dan koordinasi dengan kontraktor",
                "waktu_mulai": "Juli 2022",
                "waktu_selesai": "Desember 2023",
                "posisi_penugasan": "Bridge Construction Supervisor",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/JM/2023/234",
                "tahun": 2023,
                "nilai_proyek": 2500000000,
                "peran": "Construction Supervisor",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            },
            {
                "nama_proyek": "Inspeksi Struktur Gedung Bertingkat",
                "pemberi_kerja": "PT Pembangunan Perumahan (Persero) Tbk",
                "lokasi_proyek": "Jakarta Pusat, DKI Jakarta",
                "pengguna_jasa": "PT PP (Persero) Tbk",
                "uraian_tugas": "Melakukan inspeksi struktur beton, pengujian non-destructive test (NDT), analisis kekuatan struktur, dan penyusunan rekomendasi perbaikan",
                "waktu_mulai": "April 2024",
                "waktu_selesai": "Juni 2024",
                "posisi_penugasan": "Structural Inspector",
                "status_kepegawaian": "Tidak Tetap",
                "surat_referensi": "REF/PP/2024/089",
                "tahun": 2024,
                "nilai_proyek": 450000000,
                "peran": "Structural Inspector",
                "bersama": "PT SUCOFINDO (Persero)",
                "status_proyek": "Selesai"
            }
        ]
    }
]

def main():
    print("=" * 80)
    print("COMPLETING ALL EXPERT DATA")
    print("=" * 80)
    print()
    
    # Get all experts
    print("📥 Fetching all experts from database...")
    experts = get_all_experts()
    print(f"✓ Found {len(experts)} experts\n")
    
    # Update expert profiles
    print("📝 Updating expert profiles with complete data...")
    print("-" * 80)
    
    for profile_data in EXPERT_COMPLETE_DATA["profiles"]:
        # Find matching expert
        matching_experts = [e for e in experts if profile_data["nama_contains"].lower() in e["nama"].lower()]
        
        if not matching_experts:
            print(f"⚠️  No expert found matching: {profile_data['nama_contains']}")
            continue
        
        expert = matching_experts[0]
        expert_id = expert["id"]
        expert_name = expert["nama"]
        
        # Prepare update data
        update_data = {
            "tempat_lahir": profile_data["tempat_lahir"],
            "tanggal_lahir": profile_data["tanggal_lahir"],
            "posisi_diusulkan": profile_data["posisi_diusulkan"],
            "pendidikan_formal": profile_data["pendidikan_formal"],
            "pendidikan_non_formal": profile_data["pendidikan_non_formal"],
            "penguasaan_bahasa": profile_data["penguasaan_bahasa"]
        }
        
        try:
            update_expert_profile(expert_id, update_data)
            print(f"✓ Updated: {expert_name}")
            print(f"  - Tempat/Tanggal Lahir: {profile_data['tempat_lahir']}, {profile_data['tanggal_lahir']}")
            print(f"  - Posisi: {profile_data['posisi_diusulkan']}")
            print(f"  - Pendidikan Formal: {len(profile_data['pendidikan_formal'])} items")
            print(f"  - Pendidikan Non-Formal: {len(profile_data['pendidikan_non_formal'])} items")
            print(f"  - Bahasa: {len(profile_data['penguasaan_bahasa'])} items")
        except Exception as e:
            print(f"✗ Failed to update {expert_name}: {e}")
        
        print()
    
    # Add additional projects
    print("\n" + "=" * 80)
    print("📚 Adding additional projects to experts...")
    print("-" * 80)
    
    for project_set in ADDITIONAL_PROJECTS:
        # Find matching expert
        matching_experts = [e for e in experts if project_set["expert_name_contains"].lower() in e["nama"].lower()]
        
        if not matching_experts:
            print(f"⚠️  No expert found matching: {project_set['expert_name_contains']}")
            continue
        
        expert = matching_experts[0]
        expert_id = expert["id"]
        expert_name = expert["nama"]
        
        print(f"\n👤 {expert_name} (ID: {expert_id})")
        
        for project in project_set["projects"]:
            try:
                result = add_project_to_expert(expert_id, project)
                print(f"  ✓ Added: {project['nama_proyek']}")
                print(f"    - Lokasi: {project['lokasi_proyek']}")
                print(f"    - Periode: {project['waktu_mulai']} - {project['waktu_selesai']}")
                print(f"    - Posisi: {project['posisi_penugasan']}")
            except Exception as e:
                print(f"  ✗ Failed to add project: {e}")
    
    print("\n" + "=" * 80)
    print("✅ COMPLETED!")
    print("=" * 80)
    print("\n📊 Summary:")
    print(f"  - Profiles updated: {len(EXPERT_COMPLETE_DATA['profiles'])}")
    print(f"  - Additional projects added: {sum(len(p['projects']) for p in ADDITIONAL_PROJECTS)}")
    print("\n💡 Tip: Generate CV untuk melihat hasil dengan dynamic project tables!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
