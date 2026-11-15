import './style.css'

// Menampilkan konfigurasi dari Environment Variables
const appName = import.meta.env.VITE_APP_NAME || "Tuntask";
const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

console.log('${appName} v${appVersion} berjalan');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="container">
    <header>
      <h1>${appName}</h1>
      <p class="subtitle">Manajemen Tugas Kuliah v${appVersion}</p>
    </header>
  </main>
`