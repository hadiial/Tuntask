export interface TopBarProps {
  appName: string;
  dateLabel: string;
  studentName: string;
  studentNim: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTopBar(props: TopBarProps): string {
  const { dateLabel, studentName, studentNim } = props;
  const initial = studentName.trim().charAt(0).toUpperCase() || "M";

  return `
    <header class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
      <div class="flex items-center gap-3">
        <button
          type="button"
          id="drawerToggleBtn"
          title="Toggle Drawer"
          class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          ☰
        </button>
        <span class="text-xs text-slate-500">
          ${escapeHtml(dateLabel)}
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <span class="hidden sm:inline text-xs font-semibold text-slate-700">
          ${escapeHtml(studentName)} (${escapeHtml(studentNim)})
        </span>
        <div class="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          ${escapeHtml(initial)}
        </div>
      </div>
    </header>
  `;
}

export function bindTopBarEvents(onToggleDrawer: () => void): void {
  document.getElementById("drawerToggleBtn")?.addEventListener("click", onToggleDrawer);
}
