// ONLY FOR TESTING PURPOSES

export interface District {
  id: string;
  name: string;
}

export const DISTRICTS: District[] = [
  { id: "kab-tangerang", name: "Kab. Tangerang" },
  { id: "kab-bogor", name: "Kab. Bogor" },
  { id: "kota-bogor", name: "Kota Bogor" },
  { id: "kab-bandung", name: "Kab. Bandung" },
  { id: "kab-cianjur", name: "Kab. Cianjur" },
  { id: "kab-sukabumi", name: "Kab. Sukabumi" },
  { id: "kab-serang", name: "Kab. Serang" },
];

export function districtName(districtId: string): string {
  return DISTRICTS.find((d) => d.id === districtId)?.name ?? districtId;
}
