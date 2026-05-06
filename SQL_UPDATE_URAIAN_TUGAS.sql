-- ============================================================================
-- UPDATE URAIAN TUGAS WITH BULLET POINTS
-- ============================================================================
-- Purpose: Replace single-line uraian_tugas with multi-line bullet points
-- Format: Each line is a separate task (will be formatted as bullets in CV)
-- ============================================================================

UPDATE expert_projects
SET
    uraian_tugas = CASE 
        WHEN id % 4 = 0 THEN 'Melakukan survei dan pengumpulan data lapangan
Menganalisis data teknis dan menyusun metodologi kajian
Menyusun laporan teknis dan dokumentasi proyek
Melakukan koordinasi dengan stakeholder dan tim proyek
Mempresentasikan hasil kajian kepada klien'
        WHEN id % 4 = 1 THEN 'Melakukan review dan analisis dokumen perencanaan
Menyusun konsep dan rencana kerja detail
Melakukan supervisi pelaksanaan kegiatan di lapangan
Menyusun laporan kemajuan dan laporan akhir
Memberikan rekomendasi teknis kepada klien'
        WHEN id % 4 = 2 THEN 'Melakukan inspeksi dan audit teknis di lapangan
Mengidentifikasi potensi risiko dan permasalahan
Menyusun rekomendasi perbaikan dan mitigasi
Melakukan monitoring dan evaluasi pelaksanaan
Menyusun laporan hasil inspeksi dan audit'
        ELSE 'Melakukan asesmen dan evaluasi kondisi eksisting
Menyusun desain dan spesifikasi teknis
Melakukan perhitungan dan analisis engineering
Menyusun gambar teknis dan bill of quantity
Memberikan asistensi teknis selama pelaksanaan'
    END
WHERE uraian_tugas IS NOT NULL;

-- Verify update
SELECT 
    id,
    nama_proyek,
    LEFT(uraian_tugas, 100) as uraian_preview,
    LENGTH(uraian_tugas) as uraian_length
FROM expert_projects
ORDER BY id
LIMIT 10;
