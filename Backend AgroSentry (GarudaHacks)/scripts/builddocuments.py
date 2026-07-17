import json

with open("data/ministry_documents/opt_tanaman.json") as f:
    data = json.load(f)

documents = []
for entry in data:
    text = (
        f"Tanaman: {entry['komoditas']}. "
        f"Penyakit: {entry['nama_opt']}. "
        f"Patogen: {entry['patogen']}. "
        f"Gejala: {entry['gejala']} "
        f"Pengendalian: {entry['pengendalian']}"
    )
    documents.append(text)

with open("data/ministry_documents/flattened.json", "w") as f:
    json.dump(documents, f, ensure_ascii=False, indent=2)

print(f"Flattened {len(documents)} documents")