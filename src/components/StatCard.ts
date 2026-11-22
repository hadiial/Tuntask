export interface StatCardItem {
  id: string;
  label: string;
  value: number;
  description: string;
  dotClass: string;
  valueClass?: string;
  isActive?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderStatCard(card: StatCardItem): string {
  const activeBorderClass = card.isActive
    ? "border-red-500 ring-2 ring-red-500/15"
    : "border-slate-200";
  const valueTextClass = card.valueClass || "text-slate-900";

  return `
    <div
      data-card="${escapeHtml(card.id)}"
      class="stat-box rounded-xl border bg-white p-4 shadow-xs transition cursor-pointer hover:border-slate-300 ${activeBorderClass}"
    >
      <div class="mb-2.5 flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-600">
          ${escapeHtml(card.label)}
        </span>
        <span class="h-2.5 w-2.5 rounded-full ${escapeHtml(card.dotClass)}"></span>
      </div>
      <div class="text-2xl font-bold ${escapeHtml(valueTextClass)}">${card.value}</div>
      <div class="mt-1 text-xs text-slate-500">${escapeHtml(card.description)}</div>
    </div>
  `;
}

export function renderStatCardsGrid(cards: StatCardItem[]): string {
  return `
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      ${cards.map((card) => renderStatCard(card)).join("")}
    </section>
  `;
}

export function bindStatCardsEvents<T extends string>(
  onSelectCard: (cardId: T) => void
): void {
  document.querySelectorAll<HTMLElement>(".stat-box").forEach((el) => {
    el.addEventListener("click", () => {
      const cardId = el.dataset.card as T | undefined;
      if (cardId) {
        onSelectCard(cardId);
      }
    });
  });
}