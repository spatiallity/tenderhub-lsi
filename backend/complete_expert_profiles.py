"""
Complete expert profiles with education and other CV fields
"""
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Complete profile data for each expert
complete_profiles = {
    730: {  # Dr. Ir. Budi Santoso, M.T.
        "tempat_lahir": "Bandung",
        "tanggal_lahir": "1978-05-15",
        "pendidikan_formal": [
            "S3 Teknik Geologi, Institut Teknologi Bandung (2010)",
            "S2 Teknik Geologi, Institut Teknologi Bandung (2005)",
            "S1 Geologi, Universitas Padjadjaran (2001)"
        ],
        "pendidikan_non_formal": [
            "Advanced Mineral Exploration Techniques - Australian Mining Institute (2019)",
            "Geological Modeling and Resource Estimation - SGS Academy (2018)",
            "Environmental Impact Assessment for Mining - IFC World Bank Group (2017)"
        ],
        "penguasaan_bahasa": [
            "Bahasa Indonesia (Native)",
            "Bahasa Inggris (Fluent - TOEFL 580)",
            "Bahasa Mandarin (Basic)"
        ],
        "posisi_diusulkan": "Ahli Geologi Utama / Team Leader"
    },
    731: {  # Prof. Dr. Siti Rahayu, S.T., M.Sc.
        "tempat_lahir": "Jakarta",
        "tanggal_lahir": "1975-08-22",
        "pendidikan_formal": [
            "S3 Teknik Lingkungan, Universitas Indonesia (2012)",
            "S2 Environmental Engineering, Delft University of Technology, Netherlands (2003)",
            "S1 Teknik Lingkungan, Institut Teknologi Bandung (1998)"
        ],
        "pendidikan_non_formal": [
            "AMDAL Type A Certification - Kementerian Lingkungan Hidup dan Kehutanan (2020)",
            "Hazardous Waste Management - UNEP United Nations Environment Programme (2019)",
            "ISO 14001:2015 Lead Auditor - BSI Group (2018)"
        ],
        "penguasaan_bahasa": [
            "Bahasa Indonesia (Native)",
            "Bahasa Inggris (Fluent - IELTS 7.5)",
            "Bahasa Belanda (Intermediate)"
        ],
        "posisi_diusulkan": "Ketua Tim AMDAL / Environmental Expert"
    },
    732: {  # Ir. Andi Wijaya, M.M.
        "tempat_lahir": "Surabaya",
        "tanggal_lahir": "1980-03-10",
        "pendidikan_formal": [
            "S2 Manajemen, Universitas Gadjah Mada (2008)",
            "S1 Teknik Industri, Institut Teknologi Sepuluh Nopember (2003)"
        ],
        "pendidikan_non_formal": [
            "Project Management Professional (PMP) - Project Management Institute PMI (2021)",
            "Feasibility Study and Business Plan Development - Asian Development Bank Institute (2020)",
            "Investment Analysis and Portfolio Management - CFA Institute (2019)"
        ],
        "penguasaan_bahasa": [
            "Bahasa Indonesia (Native)",
            "Bahasa Inggris (Fluent - TOEFL 600)",
            "Bahasa Jepang (Basic)"
        ],
        "posisi_diusulkan": "Project Manager / Lead Consultant"
    },
    733: {  # Dr. Hendra Kusuma, S.Si., M.T.
        "tempat_lahir": "Yogyakarta",
        "tanggal_lahir": "1977-11-30",
        "pendidikan_formal": [
            "S3 Teknik Sipil - Sumber Daya Air, Universitas Gadjah Mada (2015)",
            "S2 Teknik Sipil, Institut Teknologi Bandung (2006)",
            "S1 Geografi, Universitas Gadjah Mada (2000)"
        ],
        "pendidikan_non_formal": [
            "Integrated Water Resources Management - UNESCO-IHE Institute for Water Education (2020)",
            "Hydrological Modeling with HEC-HMS and HEC-RAS - US Army Corps of Engineers (2018)",
            "Climate Change Adaptation for Water Resources - World Bank (2017)"
        ],
        "penguasaan_bahasa": [
            "Bahasa Indonesia (Native)",
            "Bahasa Inggris (Fluent - TOEFL 570)",
            "Bahasa Prancis (Basic)"
        ],
        "posisi_diusulkan": "Ahli Hidrologi / Water Resources Specialist"
    },
    734: {  # Dra. Maya Sari, M.Si.
        "tempat_lahir": "Medan",
        "tanggal_lahir": "1982-06-18",
        "pendidikan_formal": [
            "S2 Statistika, Institut Pertanian Bogor (2010)",
            "S1 Statistika, Universitas Sumatera Utara (2005)"
        ],
        "pendidikan_non_formal": [
            "Advanced Survey Methodology - University of Michigan Survey Research Center (2021)",
            "Data Analysis with R and Python - Coursera Johns Hopkins University (2020)",
            "Sampling Techniques for Social Research - BPS Badan Pusat Statistik (2019)"
        ],
        "penguasaan_bahasa": [
            "Bahasa Indonesia (Native)",
            "Bahasa Inggris (Fluent - TOEFL 590)",
            "Bahasa Mandarin (Intermediate)"
        ],
        "posisi_diusulkan": "Ketua Tim Survei / Survey Methodologist"
    }
}

print("=" * 60)
print("COMPLETING EXPERT PROFILES")
print("=" * 60)
print()

for expert_id, profile_data in complete_profiles.items():
    print(f"Updating Expert ID {expert_id}...")
    
    try:
        response = requests.patch(
            f"{BASE_URL}/experts/{expert_id}",
            json=profile_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        print(f"  ✓ Profile completed successfully")
        print(f"    - Tempat/Tanggal Lahir: {profile_data['tempat_lahir']}, {profile_data['tanggal_lahir']}")
        print(f"    - Pendidikan Formal: {len(profile_data['pendidikan_formal'])} entries")
        print(f"    - Pendidikan Non-Formal: {len(profile_data['pendidikan_non_formal'])} entries")
        print(f"    - Bahasa: {len(profile_data['penguasaan_bahasa'])} languages")
    except Exception as e:
        print(f"  ✗ Failed to update: {e}")
    
    print()

print("=" * 60)
print("DONE!")
print("=" * 60)
