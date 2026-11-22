import { renderAuthFormCard } from "./components/AuthFormCard";
import { renderAlertPopup, showAlertPopup, bindAlertPopupEvents,} from "./components/AlertPopup";

export interface RegisterPayload {
  full_name: string;
  nim: string;
  major: string;
  faculty: string;
  university: string;
  password: string;
}

export interface RegisterActionResult {
  ok: boolean;
  warning?: string;
}

export interface RegisterPageHandlers {
  onRegisterSubmit: (payload: RegisterPayload) => RegisterActionResult;
  onGoToLogin: () => void;
}

const REGISTER_ALERT_ID = "registerWarningPopup";

export function renderRegisterPage(appName: string): string {
  return `
    ${renderAuthFormCard({
      appName,
      title: "Daftar Akun Mahasiswa",
      subtitle:
        "Lengkapi identitas akademik dan buat password. Setelah mendaftar, kamu akan diarahkan ke halaman login.",
      formId: "registerForm",
      fields: [
        {
          id: "regName",
          label: "Nama *",
          type: "text",
          placeholder: "Nama lengkap",
          required: true,
          fullWidth: true,
        },
        {
          id: "regNim",
          label: "NIM *",
          type: "text",
          placeholder: "Nomor Induk Mahasiswa",
          required: true,
        },
        {
          id: "regMajor",
          label: "Jurusan *",
          type: "text",
          placeholder: "Contoh: Teknik Informatika",
          required: true,
        },
        {
          id: "regFaculty",
          label: "Fakultas *",
          type: "text",
          placeholder: "Contoh: Sains dan Teknologi",
          required: true,
        },
        {
          id: "regUniversity",
          label: "Universitas *",
          type: "text",
          placeholder: "Nama universitas",
          required: true,
        },
        {
          id: "regPassword",
          label: "Password *",
          type: "password",
          placeholder: "Minimal 6 karakter",
          required: true,
          minLength: 6,
        },
        {
          id: "regConfirmPassword",
          label: "Konfirmasi Password *",
          type: "password",
          placeholder: "Ulangi password",
          required: true,
          minLength: 6,
        },
      ],
      submitLabel: "Daftar Akun",
      footerPrompt: "Sudah punya akun?",
      footerLinkId: "goToLoginBtn",
      footerLinkLabel: "Masuk di sini",
    })}

    ${renderAlertPopup({
      id: REGISTER_ALERT_ID,
      title: "Peringatan Registrasi",
      message: "Periksa kembali data pendaftaran kamu.",
      confirmLabel: "Mengerti",
    })}
  `;
}

export function bindRegisterPageEvents(handlers: RegisterPageHandlers): void {
  bindAlertPopupEvents(REGISTER_ALERT_ID, {});

  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const full_name = (document.getElementById("regName") as HTMLInputElement).value.trim();
    const nim = (document.getElementById("regNim") as HTMLInputElement).value.trim();
    const major = (document.getElementById("regMajor") as HTMLInputElement).value.trim();
    const faculty = (document.getElementById("regFaculty") as HTMLInputElement).value.trim();
    const university = (document.getElementById("regUniversity") as HTMLInputElement).value.trim();
    const password = (document.getElementById("regPassword") as HTMLInputElement).value;
    const confirmPassword = (
      document.getElementById("regConfirmPassword") as HTMLInputElement
    ).value;

    if (!full_name || !nim || !major || !faculty || !university || !password || !confirmPassword) {
      showAlertPopup(REGISTER_ALERT_ID, "Semua kolom registrasi wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      showAlertPopup(
        REGISTER_ALERT_ID,
        "Peringatan: Password dan konfirmasi password tidak sesuai."
      );
      return;
    }

    const result = handlers.onRegisterSubmit({
      full_name,
      nim,
      major,
      faculty,
      university,
      password,
    });

    if (!result.ok) {
      showAlertPopup(
        REGISTER_ALERT_ID,
        result.warning || "Peringatan: Gagal mendaftarkan akun."
      );
    }
  });

  document.getElementById("goToLoginBtn")?.addEventListener("click", handlers.onGoToLogin);
}