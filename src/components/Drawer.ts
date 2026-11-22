export type DrawerMenu = "dashboard";

export interface DrawerProps {
  appName: string;
  appVersion: string;
  isOpen: boolean;
  activeMenu: DrawerMenu;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDrawer(props: DrawerProps): string {
  const { appName, appVersion, isOpen, activeMenu } = props;

  return `
    <!-- Backdrop saat drawer terbuka di layar kecil / setengah layar -->
    <div
      id="drawerBackdrop"
      class="${
        isOpen ? "block lg:hidden" : "hidden"
      } fixed inset-0 z-30 bg-slate-900/35 transition-opacity"
    ></div>

    <!-- Drawer Navigation Kiri -->
    <aside
      id="mainDrawer"
      class="${
        isOpen
          ? "w-60 translate-x-0"
          : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full"
      } fixed lg:sticky top-0 left-0 z-40 flex h-screen flex-col justify-between overflow-hidden ${
        isOpen ? "border-r border-slate-200" : "border-r-0"
      } bg-white transition-all duration-200 shrink-0"
    >
      <div class="overflow-hidden">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4">
          <div class="flex min-w-0 items-center gap-2.5">
            <div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-600 text-sm font-bold text-white">
              T
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm font-bold text-slate-900">${escapeHtml(appName)}</div>
              <div class="text-[11px] text-slate-500">v${escapeHtml(appVersion)}</div>
            </div>
          </div>

          <button
            type="button"
            id="closeDrawerBtn"
            title="Tutup Drawer"
            class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="truncate px-4 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>

        <nav class="space-y-1 px-2.5">
          <button
            type="button"
            data-menu="dashboard"
            class="drawer-item-btn flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeMenu === "dashboard"
                ? "bg-red-50 font-semibold text-red-600"
                : "text-slate-700 hover:bg-slate-100"
            }"
          >
            <span>Dashboard</span>
          </button>
        </nav>
      </div>

      <div class="truncate border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
        Tuntask - 2026
      </div>
    </aside>
  `;
}

export interface DrawerHandlers {
  onClose: () => void;
  onSelectMenu: (menu: DrawerMenu) => void;
}

export function bindDrawerEvents(handlers: DrawerHandlers): void {
  document.getElementById("closeDrawerBtn")?.addEventListener("click", handlers.onClose);
  document.getElementById("drawerBackdrop")?.addEventListener("click", handlers.onClose);

  document.querySelectorAll<HTMLButtonElement>(".drawer-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menu = btn.dataset.menu as DrawerMenu | undefined;
      if (menu) {
        handlers.onSelectMenu(menu);
      }
    });
  });
}