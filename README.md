# Tuntask

Aplikasi web untuk mengelola daftar tugas kuliah dan mata kuliah berbasis **TypeScript** dan **Vite** di sisi *frontend*, yang terhubung ke **REST API PHP (PDO)** dan database **MariaDB** di sisi *backend*. Proyek ini dikembangkan untuk memenuhi **Tugas Pertemuan 6** mata kuliah **Pengembangan Aplikasi Web**.

---

## Tautan & Informasi Deployment

- **Aplikasi Web:** https://tuntask-six.vercel.app
- **Portofolio & Catatan Tugas:** https://salmanhadi.diraksainsani.com/tugas.php
- **Repository GitHub:** https://github.com/hadiial/Tuntask

---

## Fitur Utama

- **Autentikasi Mahasiswa:** Registrasi akun baru menggunakan NIM, data mahasiswa, dan password, serta *login* dan pembaruan profil/password.
- **Manajemen Mata Kuliah:** Menambah, mengubah, menghapus, dan melihat daftar mata kuliah mahasiswa.
- **Manajemen Tugas Kuliah:**
  - Menampilkan daftar tugas kuliah beserta informasi mata kuliah dan tenggat waktu (*deadline*).
  - Menambahkan tugas baru, mengedit data tugas, dan menghapus tugas.
  - Memperbarui status tugas (`Belum Selesai`, `Selesai`, `Terlambat`).
  - Melakukan pencarian dan pemfilteran tugas serta tampilan responsif di berbagai ukuran layar.

---

## Akun Demo (Untuk Pengujian)

Untuk langsung mencoba fitur aplikasi tanpa perlu mendaftarkan akun baru, gunakan akun pengujian berikut:

- **NIM:** `1247050000`
- **Password:** `123456`

---

## Arsitektur & Teknologi

| Lapisan | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | TypeScript, Vite, CSS/Tailwind | Di-build sebagai aplikasi statis dan di-*deploy* ke Vercel |
| **Backend API** | PHP (PDO), Apache (`.htaccess`) | Menyediakan *endpoint* RESTful (`/api/health`, `/api/auth/...`, `/api/courses`, `/api/tasks`) |
| **Database** | MariaDB | Menyimpan data mahasiswa, mata kuliah, dan tugas |
| **Version Control** | Git & GitHub | Manajemen *branch*, *commit*, *Pull Request*, dan resolusi *merge conflict* |

---

## Struktur Direktori Proyek

```text
Tuntask/
├── src/                # Kode sumber frontend (TypeScript, komponen/halaman, src/api.ts)
├── public/             # Aset statis publik
├── server/             # File/konfigurasi sisi server/database (termasuk .env.example server)
├── .env.example        # Contoh variabel lingkungan non-rahasia untuk frontend Vite
├── .gitignore          # Daftar file & folder yang diabaikan Git (seperti node_modules, dist, .env)
├── index.html          # Entry point HTML aplikasi Vite
├── package.json        # Dependensi dan npm scripts (dev, build, preview)
└── README.md           # Dokumentasi proyek
```

---

## Environment Variables

Aplikasi *frontend* menggunakan variabel lingkungan berawalan `VITE_` saat proses *build* Vite:

```env
VITE_APP_NAME=Tuntask
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://tuntask.diraksainsani.com
```

> **Catatan Keamanan:** File `.env` lokal maupun kredensial database, password, dan rahasia server **tidak** disimpan di repository publik dan tidak diekspos ke kode *frontend*. Gunakan `.env.example` sebagai acuan konfigurasi.

---

## Menjalankan Proyek Secara Lokal

### 1. Clone Repository
```bash
git clone https://github.com/hadiial/Tuntask.git
cd Tuntask
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin `.env.example` menjadi `.env` lalu sesuaikan nilai `VITE_API_BASE_URL`:
```bash
cp .env.example .env
```

### 4. Jalankan Mode Pengembangan & Build Produksi
```bash
# Menjalankan server pengembangan Vite
npm run dev

# Membuat build produksi di folder dist/
npm run build

# Pratinjau hasil build produksi secara lokal
npm run preview
```

---

## Penulis

**Salman Hadi Al Ghifari (1247050065)** — Teknik Informatika, UIN Sunan Gunung Djati Bandung.
