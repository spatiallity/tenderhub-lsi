#!/usr/bin/env python3
"""
Verify CV Content - Check if SQL data appears in generated CV
"""
from docx import Document
import sys

def verify_cv_content(filename):
    """Extract and verify key fields from CV"""
    print(f"\n{'='*60}")
    print(f"📄 Verifying: {filename}")
    print(f"{'='*60}\n")
    
    try:
        doc = Document(filename)
        
        # Extract all text from tables
        all_text = []
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text = cell.text.strip()
                    if text:
                        all_text.append(text)
        
        # Join all text
        full_text = "\n".join(all_text)
        
        # Check for key indicators
        checks = {
            "Tempat Lahir": ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan"],
            "Tanggal Lahir": ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"],
            "Posisi Diusulkan": ["Team Leader", "Senior Expert", "Technical Specialist", "Project Manager"],
            "Pendidikan Formal": ["S1", "S2", "S3", "Institut", "Universitas"],
            "Lokasi Proyek": ["Jakarta", "Bandung", "Surabaya", "Semarang", "Medan"],
            "Pengguna Jasa": ["Kementerian", "PT PLN", "PT Jasa Marga"],
        }
        
        results = {}
        for field, keywords in checks.items():
            found = any(keyword in full_text for keyword in keywords)
            results[field] = found
            status = "✅" if found else "❌"
            print(f"{status} {field}: {'FOUND' if found else 'NOT FOUND'}")
        
        # Check for "Belum diisi" (should NOT appear if SQL worked)
        belum_diisi_count = full_text.count("Belum diisi")
        print(f"\n⚠️  'Belum diisi' count: {belum_diisi_count}")
        
        if belum_diisi_count > 0:
            print("   ⚠️  WARNING: Some fields still empty!")
        else:
            print("   ✅ All fields filled!")
        
        # Summary
        passed = sum(results.values())
        total = len(results)
        print(f"\n📊 Summary: {passed}/{total} checks passed")
        
        if passed == total and belum_diisi_count == 0:
            print("✨ SUCCESS: SQL data update worked perfectly!")
            return True
        else:
            print("⚠️  PARTIAL: Some data may be missing")
            return False
            
    except Exception as e:
        print(f"❌ Error reading CV: {e}")
        return False

if __name__ == "__main__":
    files = [
        "CV_Test_After_SQL.docx",
        "CV_Expert_5_Test.docx",
    ]
    
    success_count = 0
    for filename in files:
        try:
            if verify_cv_content(filename):
                success_count += 1
        except FileNotFoundError:
            print(f"⚠️  File not found: {filename}")
    
    print(f"\n{'='*60}")
    print(f"🎯 Final Result: {success_count}/{len(files)} CVs verified successfully")
    print(f"{'='*60}\n")
