import json
from supabase import create_client

SUPABASE_URL = "Supabase URL"
SUPABASE_KEY = "Secret Key Supabase"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

with open('master_database_opt.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

transformed_data = [] 

for item in data:
    text_content = (
        f"Penyakit: {item.get('nama_opt', 'N/A')}. "
        f"Patogen: {item.get('patogen', 'N/A')}. "
        f"Gejala: {item.get('gejala', 'N/A')}. "
        f"Pengendalian: {', '.join(item.get('pengendalian', []))}"
    )
    
    metadata = {
        "komoditas": item.get('komoditas', 'Umum'),
        "jenis_opt": item.get('kategori', 'Penyakit')
    }
    
    row = {
        "content": text_content,
        "metadata": metadata,
        "embedding": [0.0] * 1536  # Placeholder: Minta temanmu isi ini dengan embedding asli
    }
    transformed_data.append(row)

try:
    response = supabase.table('agriculture_guidelines').insert(transformed_data).execute()
    print("Mantap! Data berhasil masuk ke tabel agriculture_guidelines.")
except Exception as e:
    print(f"Waduh, ada error: {e}")