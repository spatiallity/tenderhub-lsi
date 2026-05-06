"""
Fill ALL expert data with complete realistic information
This script will update ALL experts in database with:
- Personal data (tempat_lahir, tanggal_lahir, posisi_diusulkan)
- Education (pendidikan_formal, pendidikan_non_formal)
- Language skills (penguasaan_bahasa)
- Complete project data with all CV template fields
"""
import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

# Indonesian cities for birthplace
CITIES = [
    "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang",
    "Medan", "Palembang", "Makassar", "Denpasar", "Malang",
    "Solo", "Bogor", "Depok", "Tangerang", "Bekasi",
    "Padang", "Manado", "Balikpapan", "Pontianak", "Banjarmasin"
]

# Universities
UNIVERSITIES = [
    "Institut Teknologi Bandung",
    "Universitas Indonesia",
    "Universitas Gadjah Mada",
    "Institut Teknologi Sepuluh Nopember",
    "Universitas Padjadjaran",
    "Universitas Diponegoro",
    "Universitas Brawijaya",
    "Universitas Hasanuddin",
    "Universitas Airlangga",
    "Institut Pertanian Bogor"
]

# Majors
MAJORS = [
    "Teknik Sipil", "Teknik Elektro", "Teknik Mesin", "Teknik Kimia",
    "Teknik Industri", "Teknik Lingkungan", "Teknik Geologi",
    "Teknik Informatika", "Arsitektur", "Perencanaan Wilayah dan Kota",
    "Kesehatan Masyarakat", "Gizi", "Manajemen", "Ekonomi"
]

# Positions
POSITIONS = [
    "Team Leader", "Senior Expert", "Technical Specialist",
    "Project Manager", "Quality Assurance Specialist", "Consultant",
    "Senior Consultant", "Lead Engineer", "Chief Engineer"
]

# Training/Certifications
TRAININGS = [
    "Project Management Professional (PMP), PMI",
    "Certified Quality Engineer (CQE), ASQ",
    "ISO 9001:2015 Lead Auditor, BSI",
    "ISO 14001:2015 Lead Auditor, BSI",
    "OHSAS 18001 Lead Auditor, BSI",
    "Six Sigma Green Belt, IASSC",
    "Certified Scrum Master (CSM), Scrum Alliance",
    "AMDAL Training, Kementerian Lingkungan Hidup",
    "K3 Umum Certification, Kemnaker",
    "Ahli K3 Konstruksi, Kemnaker",
    "Training Advanced Engineering, Various Institutions",
    "Workshop Technical Skills Development",
    "Certified Professional Engineer (CPE)",
    "Risk Management Training, PMI"
]

# Project locations
PROJECT_LOCATIONS = [
    "Jakarta", "Bandung, Jawa Barat", "Surabaya, Jawa Timur",
    "Semarang, Jawa Tengah", "Yogyakarta", "Medan, Sumatera Utara",
    "Palembang, Sumatera Selatan", "Makassar, Sulawesi Selatan",
    "Balikpapan, Kalimantan Timur", "Pontianak, Kalimantan Barat",
    "Denpasar, Bali", "Manado, Sulawesi Utara", "Papua",
    "Kalimantan Tengah", "Sulawesi Tenggara", "Nusa Tenggara Timur"
]

# Clients
CLIENTS = [
    "Kementerian PUPR", "Kementerian ESDM", "Kementerian Perhubungan",
    "Kementerian Kesehatan", "Kementerian Pendidikan",
    "PT PLN (Persero)", "PT Pertamina (Persero)", "PT Telkom Indonesia",
    "PT Jasa Marga (Persero) Tbk", "PT Waskita Karya (Persero) Tbk",
    "PT Adhi Karya (Persero) Tbk", "PT Wijaya Karya (Persero) Tbk",
    "PT Hutama Karya (Persero)", "PT Pembangunan Perumahan (Persero) Tbk",
    "PT Freeport Indonesia", "PT Aneka Tambang Tbk", "PT Bukit Asam Tbk",
    "Pemerintah Provinsi DKI Jakarta", "Pemerintah Provinsi Jawa Barat",
    "Pemerintah Provinsi Jawa Timur", "Pemerintah Kota Bandung"
]

# Task descriptions
TASK_DESCRIPTIONS = [
    "Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian",
    "Melaksanakan inspeksi teknis, pengujian kualitas, verifikasi dokumen, evaluasi sistem manajemen, dan penyusunan rekomendasi perbaikan",
    "Menyusun dokumen perencanaan, analisis kelayakan, perhitungan teknis, gambar desain, dan spesifikasi teknis sesuai standar",
    "Melakukan pengawasan konstruksi, pemeriksaan kualitas material, monitoring progress pekerjaan, review shop drawing, dan koordinasi dengan kontraktor",
    "Melaksanakan audit sistem manajemen, verifikasi implementasi prosedur, evaluasi kinerja, identifikasi ketidaksesuaian, dan penyusunan laporan audit",
    "Melakukan kajian dampak lingkungan, analisis risiko, penyusunan dokumen AMDAL, koordinasi dengan instansi terkait, dan presentasi di komisi AMDAL",
    "Menyusun rencana kerja, koordinasi tim, monitoring pelaksanaan proyek, pengendalian biaya dan waktu, serta pelaporan kepada klien",
    "Melakukan analisis teknis, perhitungan struktur, desain sistem, simulasi, dan penyusunan spesifikasi teknis detail",
    "Melaksanakan pengujian dan komisioning, verifikasi performa sistem, troubleshooting, dan penyusunan manual operasional",
    "Melakukan capacity building, pelatihan teknis, transfer knowledge, pendampingan implementasi, dan evaluasi hasil pelatihan"
]

def generate_birth_date():
    """Generate random birth date between 1965-1990"""
    start_date = datetime(1965, 1, 1)
    end_date = datetime(1990, 12, 31)
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    birth_date = start_date + timedelta(days=random_days)
    return birth_date.strftime("%d %B %Y")

def generate_education(level, major=None):
    """Generate education entry"""
    if major is None:
        major = random.choice(MAJORS)
    university = random.choice(UNIVERSITIES)
    
    if level == "S1":
        year = random.randint(1985, 2005)
    elif level == "S2":
        year = random.randint(1990, 2010)
    else:  # S3
        year = random.randint(1995, 2015)
    
    return f"{level} {major}, {university} ({year})"

def update_expert_complete_data(expert_id, expert_name):
    """Update expert with complete data"""
    print(f"\n{'='*80}")
    print(f"Updating Expert ID {expert_id}: {expert_name}")
    print(f"{'='*80}")
    
    # Generate personal data
    tempat_lahir = random.choice(CITIES)
    tanggal_lahir = generate_birth_date()
    posisi_diusulkan = random.choice(POSITIONS)
    
    # Generate education
    has_s3 = random.choice([True, False])
    pendidikan_formal = []
    
    if has_s3:
        major = random.choice(MAJORS)
        pendidikan_formal.append(generate_education("S3", major))
        pendidikan_formal.append(generate_education("S2", major))
        pendidikan_formal.append(generate_education("S1", major))
    else:
        major = random.choice(MAJORS)
        pendidikan_formal.append(generate_education("S2", major))
        pendidikan_formal.append(generate_education("S1", major))
    
    # Generate non-formal education
    num_trainings = random.randint(2, 4)
    pendidikan_non_formal = random.sample(TRAININGS, num_trainings)
    
    # Language skills
    penguasaan_bahasa = [
        "Bahasa Indonesia: Sangat Baik",
        f"Bahasa Inggris: {random.choice(['Sangat Baik', 'Baik', 'Cukup'])}"
    ]
    
    # Sometimes add third language
    if random.choice([True, False]):
        third_lang = random.choice(["Bahasa Mandarin", "Bahasa Jepang", "Bahasa Arab", "Bahasa Belanda", "Bahasa Prancis"])
        penguasaan_bahasa.append(f"{third_lang}: {random.choice(['Baik', 'Cukup'])}")
    
    # Update expert profile
    update_data = {
        "tempat_lahir": tempat_lahir,
        "tanggal_lahir": tanggal_lahir,
        "posisi_diusulkan": posisi_diusulkan,
        "pendidikan_formal": pendidikan_formal,
        "pendidikan_non_formal": pendidikan_non_formal,
        "penguasaan_bahasa": penguasaan_bahasa
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/experts/{expert_id}",
            json=update_data
        )
        response.raise_for_status()
        
        print(f"✓ Profile updated:")
        print(f"  - Tempat/Tanggal Lahir: {tempat_lahir}, {tanggal_lahir}")
        print(f"  - Posisi: {posisi_diusulkan}")
        print(f"  - Pendidikan Formal: {len(pendidikan_formal)} items")
        print(f"  - Pendidikan Non-Formal: {len(pendidikan_non_formal)} items")
        print(f"  - Bahasa: {len(penguasaan_bahasa)} items")
        
        return True
    except Exception as e:
        print(f"✗ Failed to update profile: {e}")
        return False

def update_project_complete_data(expert_id, project_id, project_name):
    """Update project with complete CV template fields"""
    
    # Generate complete project data
    lokasi_proyek = random.choice(PROJECT_LOCATIONS)
    pengguna_jasa = random.choice(CLIENTS)
    uraian_tugas = random.choice(TASK_DESCRIPTIONS)
    
    # Generate dates
    year = random.randint(2018, 2024)
    start_month = random.choice(["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"])
    end_month = random.choice(["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                                "Juli", "Agustus", "September", "Oktober", "November", "Desember"])
    
    waktu_mulai = f"{start_month} {year}"
    waktu_selesai = f"{end_month} {year}"
    
    posisi_penugasan = random.choice([
        "Team Leader", "Senior Engineer", "Technical Specialist", "Consultant",
        "Project Manager", "Quality Assurance", "Site Engineer", "Supervisor",
        "Coordinator", "Expert", "Ahli Utama", "Ketua Tim"
    ])
    
    status_kepegawaian = random.choice(["Tetap", "Tidak Tetap"])
    
    # Generate reference number or "-"
    if random.choice([True, False, False]):  # 33% chance of having reference
        surat_referensi = f"REF/{random.randint(100,999)}/SCF/{year}"
    else:
        surat_referensi = "-"
    
    update_data = {
        "lokasi_proyek": lokasi_proyek,
        "pengguna_jasa": pengguna_jasa,
        "uraian_tugas": uraian_tugas,
        "waktu_mulai": waktu_mulai,
        "waktu_selesai": waktu_selesai,
        "posisi_penugasan": posisi_penugasan,
        "status_kepegawaian": status_kepegawaian,
        "surat_referensi": surat_referensi
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/experts/projects/{project_id}",
            json=update_data
        )
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"  ✗ Failed to update project {project_id}: {e}")
        return False

def main():
    print("="*80)
    print("FILLING ALL EXPERT DATA WITH COMPLETE INFORMATION")
    print("="*80)
    print()
    
    # Get all experts
    print("📥 Fetching all experts...")
    try:
        response = requests.get(f"{BASE_URL}/experts")
        response.raise_for_status()
        experts = response.json()
        print(f"✓ Found {len(experts)} experts\n")
    except Exception as e:
        print(f"✗ Failed to fetch experts: {e}")
        return
    
    success_count = 0
    project_update_count = 0
    
    for expert in experts:
        expert_id = expert['id']
        expert_name = expert['nama']
        
        # Update expert profile
        if update_expert_complete_data(expert_id, expert_name):
            success_count += 1
            
            # Update all projects for this expert
            projects = expert.get('projects', [])
            if projects:
                print(f"\n  Updating {len(projects)} projects...")
                for project in projects:
                    project_id = project['id']
                    project_name = project['nama_proyek']
                    if update_project_complete_data(expert_id, project_id, project_name):
                        project_update_count += 1
                        print(f"  ✓ Updated: {project_name[:50]}...")
    
    print("\n" + "="*80)
    print("✅ COMPLETED!")
    print("="*80)
    print(f"\n📊 Summary:")
    print(f"  - Experts updated: {success_count} / {len(experts)}")
    print(f"  - Projects updated: {project_update_count}")
    print(f"\n💡 Next: Generate CV untuk melihat hasil!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
