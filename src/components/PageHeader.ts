export interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPageHeader(props: PageHeaderProps): string {
  const { title, subtitle, actionLabel } = props;

  return `
    <section class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          ${escapeHtml(title)}
        </h1>
        <p class="mt-0.5 text-xs sm:text-sm text-slate-500">
          ${escapeHtml(subtitle)}
        </p>
      </div>

      <button
        type="button"
        id="pagePrimaryActionBtn"
        class="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
      >
        <span>${escapeHtml(actionLabel)}</span>
      </button>
    </section>
  `;
}

export function bindPageHeaderEvents(onPrimaryAction: () => void): void {
  document.getElementById("pagePrimaryActionBtn")?.addEventListener("click", onPrimaryAction);
}