export const STAGES = [
  { label: ['Kelahiran'], icon: 'baby' },
  { label: ['Sekolah'], icon: 'school' },
  { label: ['KTP &', 'Kuliah'], icon: 'pair' },
  { label: ['Kerja'], icon: 'work' },
  { label: ['Lansia'], icon: 'old' },
]

export const CARDS = {
  0: [['baby', 'Akta Kelahiran Online'], ['doc', 'Kartu Identitas Anak']],
  1: [['school', 'Cari Sekolah Terdekat'], ['cap', 'Info Beasiswa Pelajar']],
  2: [['id', 'Cari Layanan KTP Digital'], ['cap', 'Daftar Beasiswa Lamongan Gempur']],
  3: [['work', 'Info Lowongan Kerja'], ['doc', 'Izin Usaha Online']],
  4: [['old', 'Layanan Lansia'], ['doc', 'Bantuan Sosial']],
}

// Fallback list for the "Pariwisata" tab. Replace with API data when an endpoint exists.
export const TOURISM = [
  { id: 'wbl', icon: 'doc', title: 'Wisata Bahari Lamongan (WBL)', url: null },
  { id: 'maharani-zoo', icon: 'doc', title: 'Maharani Zoo & Goa Maharani', url: null },
  { id: 'sunan-drajat', icon: 'doc', title: 'Wisata Religi Makam Sunan Drajat', url: null },
  { id: 'sendang-duwur', icon: 'doc', title: 'Makam Sunan Sendang Duwur', url: null },
  { id: 'pantai-lorena', icon: 'doc', title: 'Pantai Lorena', url: null },
]

// Fallback list for the "Industri" tab. Replace with API data when an endpoint exists.
export const INDUSTRI = [
  { id: 'izin-usaha', icon: 'work', title: 'Izin Usaha Online (OSS)', url: null },
  { id: 'kawasan-industri', icon: 'work', title: 'Info Kawasan Industri', url: null },
  { id: 'umkm', icon: 'work', title: 'Pendaftaran & Pembinaan UMKM', url: null },
  { id: 'investasi', icon: 'work', title: 'Peluang Investasi Daerah', url: null },
  { id: 'perikanan', icon: 'work', title: 'Industri Perikanan & Tambak', url: null },
]

// Fallback list for the "Dinas" tab. Replace with API data when an endpoint exists.
export const DINAS = [
  { id: 'dispendukcapil', icon: 'id', title: 'Dinas Kependudukan & Pencatatan Sipil', url: null },
  { id: 'dinkes', icon: 'doc', title: 'Dinas Kesehatan', url: null },
  { id: 'disdik', icon: 'school', title: 'Dinas Pendidikan', url: null },
  { id: 'dinsos', icon: 'doc', title: 'Dinas Sosial', url: null },
  { id: 'disnaker', icon: 'work', title: 'Dinas Tenaga Kerja', url: null },
]

export const PINS = [
  { id: 1, tone: 'teal', icon: 'doc', name: 'Daftar KTP Online', label: ['Daftar KTP', 'Online'], left: 50, top: 13 },
  { id: 2, tone: 'teal', icon: 'cap', name: 'Beasiswa Gempur', label: ['Beasiswa', 'Gempur'], left: 61, top: 40 },
  { id: 3, tone: 'purple', icon: 'id', name: 'Daftar KTP Online', label: ['Daftar KTP', 'Online'], left: 31, top: 52 },
  { id: 4, tone: 'teal', icon: 'cap', name: 'Beasiswa Gempur', label: ['Beasiswa', 'Gempur'], left: 56, top: 68 },
  { id: 5, tone: 'blue', icon: 'id', name: 'Daftar KTP Online', label: ['Daftar KTP', 'Online'], left: 78, top: 44 },
]
