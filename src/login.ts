import { renderAuthFormCard } from "./components/AuthFormCard";
import { renderAlertPopup, showAlertPopup, bindAlertPopupEvents,} from "./components/AlertPopup";

export interface LoginCredentials {
  nim: string;
  password: string;
}

export interface LoginPageHandlers {
  onLoginSuccess: (credentials: LoginCredentials) => boolean;
  onGoToRegister: () => void;
}

const LOGIN_ALERT_ID = "loginWarningPopup";

export function renderLoginPage(appName: string): string {
  return `
    ${renderAuthFormCard({
      appName,
      title: "Masuk ke Tuntask",
      subtitle: "Gunakan NIM dan password akun mahasiswa untuk mengakses dashboard tugas.",
      formId: "loginForm",
      fields: [
        {
          id: "loginNim",
          label: "NIM *",
          type: "text",
          placeholder: "Contoh: 1247050065",
          required: true,
          fullWidth: true,
        },
        {
          id: "loginPassword",
          label: "Password *",
          type: "password",
          placeholder: "Masukkan password",
          required: true,
          fullWidth: true,
        },
      ],
      submitLabel: "Masuk",
      footerPrompt: "Belum punya akun?",
      footerLinkId: "goToRegisterBtn",
      footerLinkLabel: "Daftar sekarang",
    })}

    ${renderAlertPopup({
      id: LOGIN_ALERT_ID,
      title: "Peringatan Login",
      message: "NIM atau password tidak sesuai. Silakan periksa kembali data login kamu.",
      confirmLabel: "Coba Lagi",
    })}
  `;
}

export function bindLoginPageEvents(handlers: LoginPageHandlers): void {
  bindAlertPopupEvents(LOGIN_ALERT_ID, {});

  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nim = (document.getElementById("loginNim") as HTMLInputElement).value.trim();
    const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

    if (!nim || !password) {
      showAlertPopup(LOGIN_ALERT_ID, "NIM dan password wajib diisi.");
      return;
    }

    const ok = handlers.onLoginSuccess({ nim, password });
    if (!ok) {
      showAlertPopup(
        LOGIN_ALERT_ID,
        "NIM atau password salah. Pastikan NIM dan password sudah benar."
      );
    }
  });

  document.getElementById("goToRegisterBtn")?.addEventListener("click", handlers.onGoToRegister);
}