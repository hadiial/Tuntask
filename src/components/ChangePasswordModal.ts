export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordModalHandlers {
  onVerifyOldPassword: (oldPassword: string) => boolean;
  onConfirmChange: (payload: ChangePasswordPayload) => void;
}

export function renderChangePasswordModal(): string {
  return `
    <div
      id="changePasswordModalOverlay"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Ganti Password</h2>
          <button
            type="button"
            id="closePasswordModalBtn"
            class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div
          id="passwordFormAlert"
          class="mb-3 hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
        ></div>

        <form id="changePasswordForm" class="space-y-3">
          <div>
            <label for="oldPasswordInput" class="mb-1 block text-xs font-semibold text-slate-700">
              Password Lama *
            </label>
            <input
              type="password"
              id="oldPasswordInput"
              required
              placeholder="Masukkan password lama"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label for="newPasswordInput" class="mb-1 block text-xs font-semibold text-slate-700">
              Password Baru *
            </label>
            <input
              type="password"
              id="newPasswordInput"
              required
              minlength="6"
              placeholder="Minimal 6 karakter"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label for="confirmPasswordInput" class="mb-1 block text-xs font-semibold text-slate-700">
              Konfirmasi Password Baru *
            </label>
            <input
              type="password"
              id="confirmPasswordInput"
              required
              minlength="6"
              placeholder="Ulangi password baru"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              id="cancelPasswordModalBtn"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
            >
              Lanjutkan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Popup Konfirmasi Ganti Password -->
    <div
      id="confirmPasswordPopupOverlay"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/55 p-4"
    >
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 class="text-base font-bold text-slate-900">Konfirmasi Ganti Password</h3>
        <p class="mt-1.5 text-xs leading-relaxed text-slate-600">
          Apakah kamu yakin ingin mengubah password akun sekarang?
        </p>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            id="cancelConfirmPasswordBtn"
            class="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            id="confirmChangePasswordBtn"
            class="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            Ya, Ganti Password
          </button>
        </div>
      </div>
    </div>
  `;
}

function setAlert(message: string | null): void {
  const alertEl = document.getElementById("passwordFormAlert");
  if (!alertEl) return;
  if (!message) {
    alertEl.textContent = "";
    alertEl.classList.add("hidden");
    return;
  }
  alertEl.textContent = message;
  alertEl.classList.remove("hidden");
}

function toggleOverlay(id: string, show: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("hidden", !show);
  el.classList.toggle("flex", show);
}

export function openChangePasswordModal(): void {
  setAlert(null);
  (document.getElementById("oldPasswordInput") as HTMLInputElement | null)?.setAttribute("value", "");
  const form = document.getElementById("changePasswordForm") as HTMLFormElement | null;
  form?.reset();
  toggleOverlay("changePasswordModalOverlay", true);
  (document.getElementById("oldPasswordInput") as HTMLInputElement | null)?.focus();
}

export function closeChangePasswordModal(): void {
  toggleOverlay("confirmPasswordPopupOverlay", false);
  toggleOverlay("changePasswordModalOverlay", false);
}

export function bindChangePasswordModalEvents(handlers: ChangePasswordModalHandlers): void {
  let pendingPayload: ChangePasswordPayload | null = null;

  const closeAll = (): void => {
    pendingPayload = null;
    closeChangePasswordModal();
  };

  document.getElementById("closePasswordModalBtn")?.addEventListener("click", closeAll);
  document.getElementById("cancelPasswordModalBtn")?.addEventListener("click", closeAll);
  document.getElementById("changePasswordModalOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeAll();
  });

  document.getElementById("changePasswordForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const oldPassword = (document.getElementById("oldPasswordInput") as HTMLInputElement).value;
    const newPassword = (document.getElementById("newPasswordInput") as HTMLInputElement).value;
    const confirmPassword = (
      document.getElementById("confirmPasswordInput") as HTMLInputElement
    ).value;

    if (!handlers.onVerifyOldPassword(oldPassword)) {
      setAlert("Peringatan: Password lama salah.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert("Peringatan: Password baru dan konfirmasi password baru tidak sesuai.");
      return;
    }

    setAlert(null);
    pendingPayload = { oldPassword, newPassword };
    toggleOverlay("confirmPasswordPopupOverlay", true);
  });

  document.getElementById("cancelConfirmPasswordBtn")?.addEventListener("click", () => {
    pendingPayload = null;
    toggleOverlay("confirmPasswordPopupOverlay", false);
  });

  document.getElementById("confirmPasswordPopupOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      pendingPayload = null;
      toggleOverlay("confirmPasswordPopupOverlay", false);
    }
  });

  document.getElementById("confirmChangePasswordBtn")?.addEventListener("click", () => {
    if (!pendingPayload) return;
    handlers.onConfirmChange(pendingPayload);
    pendingPayload = null;
    closeChangePasswordModal();
    document.getElementById("passwordUpdatedFeedback")?.classList.remove("hidden");
  });
}