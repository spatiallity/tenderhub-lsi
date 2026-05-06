# PowerShell script to complete all expert data
$BASE_URL = "http://localhost:8000/api/v1"

Write-Host "=" * 80
Write-Host "COMPLETING ALL EXPERT DATA"
Write-Host "=" * 80
Write-Host ""

# Get all experts
Write-Host "Fetching all experts..."
$experts = Invoke-RestMethod -Uri "$BASE_URL/experts" -Method Get
Write-Host "Found $($experts.Count) experts`n"

# Expert data to update
$expertUpdates = @(
    @{
        nama_contains = "Budi Santoso"
        data = @{
            tempat_lahir = "Bandung"
            tanggal_lahir = "15 Maret 1975"
            posisi_diusulkan = "Team Leader"
            pendidikan_formal = @(
                "S3 Teknik Geologi, Institut Teknologi Bandung (2005)",
                "S2 Teknik Pertambangan, Institut Teknologi Bandung (2000)",
                "S1 Teknik Geologi, Universitas Padjadjaran (1997)"
            )
            pendidikan_non_formal = @(
                "Sertifikasi Project Management Professional (PMP), PMI (2010)",
                "Training Advanced Geological Mapping, USGS (2008)",
                "Workshop Environmental Impact Assessment, AMDAL (2006)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Mandarin: Cukup"
            )
        }
    },
    @{
        nama_contains = "Siti Rahayu"
        data = @{
            tempat_lahir = "Yogyakarta"
            tanggal_lahir = "22 Juli 1970"
            posisi_diusulkan = "Senior Expert"
            pendidikan_formal = @(
                "S3 Teknik Lingkungan, Institut Teknologi Bandung (2003)",
                "S2 Teknik Lingkungan, Universitas Gadjah Mada (1998)",
                "S1 Teknik Kimia, Universitas Gadjah Mada (1993)"
            )
            pendidikan_non_formal = @(
                "Certified Environmental Auditor, ISO 14001 (2012)",
                "Training Waste Management Systems, JICA (2009)",
                "Workshop Climate Change Adaptation, UNDP (2015)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Jepang: Baik"
            )
        }
    },
    @{
        nama_contains = "Andi Wijaya"
        data = @{
            tempat_lahir = "Surabaya"
            tanggal_lahir = "10 Januari 1980"
            posisi_diusulkan = "Technical Specialist"
            pendidikan_formal = @(
                "S2 Teknik Sipil, Institut Teknologi Sepuluh Nopember (2008)",
                "S1 Teknik Sipil, Universitas Brawijaya (2003)"
            )
            pendidikan_non_formal = @(
                "Sertifikasi Ahli K3 Konstruksi, Kemnaker (2010)",
                "Training Bridge Design and Analysis, ASCE (2011)",
                "Workshop BIM Implementation, Autodesk (2018)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Belanda: Cukup"
            )
        }
    },
    @{
        nama_contains = "Hendra Kusuma"
        data = @{
            tempat_lahir = "Jakarta"
            tanggal_lahir = "5 September 1978"
            posisi_diusulkan = "Project Manager"
            pendidikan_formal = @(
                "S3 Manajemen Proyek, Universitas Indonesia (2012)",
                "S2 Teknik Industri, Institut Teknologi Bandung (2005)",
                "S1 Teknik Mesin, Universitas Indonesia (2000)"
            )
            pendidikan_non_formal = @(
                "Certified Scrum Master (CSM), Scrum Alliance (2016)",
                "Training Risk Management, PMI (2013)",
                "Workshop Agile Project Management, ICAgile (2017)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik",
                "Bahasa Prancis: Baik"
            )
        }
    },
    @{
        nama_contains = "Maya Sari"
        data = @{
            tempat_lahir = "Medan"
            tanggal_lahir = "18 April 1982"
            posisi_diusulkan = "Quality Assurance Specialist"
            pendidikan_formal = @(
                "S2 Teknik Kimia, Universitas Gadjah Mada (2009)",
                "S1 Teknik Kimia, Universitas Sumatera Utara (2004)"
            )
            pendidikan_non_formal = @(
                "Certified Quality Engineer (CQE), ASQ (2014)",
                "Training ISO 9001:2015 Lead Auditor, BSI (2016)",
                "Workshop Six Sigma Green Belt, IASSC (2015)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Malaysia: Baik"
            )
        }
    },
    @{
        nama_contains = "Lestari Wulandari"
        data = @{
            tempat_lahir = "Semarang"
            tanggal_lahir = "12 November 1976"
            posisi_diusulkan = "Health Survey Expert"
            pendidikan_formal = @(
                "S2 Kesehatan Masyarakat, Universitas Gadjah Mada (2005)",
                "S1 Gizi, Universitas Diponegoro (2000)"
            )
            pendidikan_non_formal = @(
                "Training Nutritional Survey Methods, WHO (2010)",
                "Workshop Data Analysis with SPSS, IBM (2012)",
                "Certified Health Education Specialist (CHES), NCHEC (2015)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik"
            )
        }
    },
    @{
        nama_contains = "Ahmad Fauzi"
        data = @{
            tempat_lahir = "Palembang"
            tanggal_lahir = "25 Februari 1979"
            posisi_diusulkan = "IT Infrastructure Specialist"
            pendidikan_formal = @(
                "S2 Teknik Informatika, Institut Teknologi Bandung (2007)",
                "S1 Teknik Elektro, Universitas Sriwijaya (2002)"
            )
            pendidikan_non_formal = @(
                "Cisco Certified Network Professional (CCNP), Cisco (2013)",
                "Training Cloud Architecture, AWS (2018)",
                "Workshop Cybersecurity Fundamentals, CompTIA (2019)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Sangat Baik"
            )
        }
    },
    @{
        nama_contains = "Dewi Kartika"
        data = @{
            tempat_lahir = "Denpasar"
            tanggal_lahir = "8 Juni 1983"
            posisi_diusulkan = "Environmental Consultant"
            pendidikan_formal = @(
                "S2 Ilmu Lingkungan, Universitas Indonesia (2010)",
                "S1 Biologi, Universitas Udayana (2005)"
            )
            pendidikan_non_formal = @(
                "Training Environmental Impact Assessment, AMDAL (2011)",
                "Workshop Marine Conservation, WWF (2014)",
                "Certified Environmental Professional (CEP), NAEP (2016)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Bali: Sangat Baik"
            )
        }
    },
    @{
        nama_contains = "Rudi Hartono"
        data = @{
            tempat_lahir = "Makassar"
            tanggal_lahir = "30 Agustus 1977"
            posisi_diusulkan = "Marine Engineering Expert"
            pendidikan_formal = @(
                "S2 Teknik Kelautan, Institut Teknologi Sepuluh Nopember (2006)",
                "S1 Teknik Perkapalan, Universitas Hasanuddin (2001)"
            )
            pendidikan_non_formal = @(
                "Training Offshore Structure Design, DNV GL (2012)",
                "Workshop Port and Harbor Engineering, PIANC (2014)",
                "Certified Marine Surveyor, IIMS (2015)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Bugis: Sangat Baik"
            )
        }
    },
    @{
        nama_contains = "Fitri Handayani"
        data = @{
            tempat_lahir = "Padang"
            tanggal_lahir = "14 Desember 1981"
            posisi_diusulkan = "Social Development Specialist"
            pendidikan_formal = @(
                "S2 Sosiologi, Universitas Indonesia (2008)",
                "S1 Antropologi, Universitas Andalas (2003)"
            )
            pendidikan_non_formal = @(
                "Training Participatory Rural Appraisal, World Bank (2010)",
                "Workshop Gender Mainstreaming, UN Women (2013)",
                "Certified Social Impact Assessment Professional, IAIA (2015)"
            )
            penguasaan_bahasa = @(
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik",
                "Bahasa Minang: Sangat Baik"
            )
        }
    }
)

# Update each expert
Write-Host "Updating expert profiles..."
Write-Host ("-" * 80)

$updateCount = 0
foreach ($update in $expertUpdates) {
    # Find matching expert
    $expert = $experts | Where-Object { $_.nama -like "*$($update.nama_contains)*" } | Select-Object -First 1
    
    if ($null -eq $expert) {
        Write-Host "Warning: No expert found matching '$($update.nama_contains)'" -ForegroundColor Yellow
        continue
    }
    
    try {
        $body = $update.data | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$BASE_URL/experts/$($expert.id)" `
            -Method Patch `
            -Body $body `
            -ContentType "application/json"
        
        Write-Host "Updated: $($expert.nama)" -ForegroundColor Green
        Write-Host "  - Tempat/Tanggal Lahir: $($update.data.tempat_lahir), $($update.data.tanggal_lahir)"
        Write-Host "  - Posisi: $($update.data.posisi_diusulkan)"
        Write-Host "  - Pendidikan Formal: $($update.data.pendidikan_formal.Count) items"
        Write-Host "  - Pendidikan Non-Formal: $($update.data.pendidikan_non_formal.Count) items"
        Write-Host "  - Bahasa: $($update.data.penguasaan_bahasa.Count) items"
        Write-Host ""
        
        $updateCount++
    }
    catch {
        Write-Host "Failed to update $($expert.nama): $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "=" * 80
Write-Host "COMPLETED!" -ForegroundColor Green
Write-Host "=" * 80
Write-Host ""
Write-Host "Summary:"
Write-Host "  - Profiles updated: $updateCount / $($expertUpdates.Count)"
Write-Host ""
Write-Host "Tip: Generate CV untuk melihat hasil dengan dynamic project tables!" -ForegroundColor Cyan
