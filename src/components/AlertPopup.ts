export interface AlertPopupProps {
  id: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\x22/g, "&quot;");
}

export function renderAlertPopup(props: AlertPopupProps): string {
  const {
    id,
    title,
    message,
    confirmLabel = "Mengerti",
    cancelLabel,
  } = props;

  const cancelBtnHtml = cancelLabel
    ? `
      <button
        type="button"
        data-popup-cancel="${escapeHtml(id)}"
        class="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        ${escapeHtml(cancelLabel)}
      </button>
    `
    : "";

  return `
    <div
      id="${escapeHtml(id)}"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/50 p-4"
    >
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="flex items-start gap-2.5">
          <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-xs font-bold text-red-700">
            !
          </span>
          <div>
            <h3 class="text-base font-bold text-slate-900">${escapeHtml(title)}</h3>
            <p class="mt-1 text-xs leading-relaxed text-slate-600">
              ${escapeHtml(message)}
            </p>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          ${cancelBtnHtml}
          <button
            type="button"
            data-popup-confirm="${escapeHtml(id)}"
            class="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            ${escapeHtml(confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function showAlertPopup(id: string, customMessage?: string): void {
  const popup = document.getElementById(id);
  if (!popup) return;

  if (customMessage) {
    const msgEl = popup.querySelector("p");
    if (msgEl) msgEl.textContent = customMessage;
  }

  popup.classList.remove("hidden");
  popup.classList.add("flex");
}

export function hideAlertPopup(id: string): void {
  const popup = document.getElementById(id);
  if (!popup) return;
  popup.classList.add("hidden");
  popup.classList.remove("flex");
}

export interface AlertPopupHandlers {
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function bindAlertPopupEvents(id: string, handlers: AlertPopupHandlers): void {
  const popup = document.getElementById(id);
  if (!popup) return;

  popup.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      hideAlertPopup(id);
      handlers.onCancel?.();
    }
  });

  popup
    .querySelector<HTMLButtonElement>(`[data-popup-confirm="${id}"]`)
    ?.addEventListener("click", () => {
      hideAlertPopup(id);
      handlers.onConfirm?.();
    });

  popup
    .querySelector<HTMLButtonElement>(`[data-popup-cancel="${id}"]`)
    ?.addEventListener("click", () => {
      hideAlertPopup(id);
      handlers.onCancel?.();
    });
}