export interface TaskRowItem {
  id: string;
  task_title: string;
  task_desc: string;
  course_name: string;
  lecturer_name?: string | null;
  semester?: string | null;
  assigned_date: string;
  created_at: string;
  deadline: string;
  submission_link: string;
  status: "Belum Selesai" | "Selesai";
  badgeLabel: string;
  badgeVariant: "pending" | "urgent" | "completed";
}

export interface TaskTableProps {
  rows: TaskRowItem[];
  searchKeyword: string;
  createdFilter: string;
  deadlineFilter: string;
  sortField: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getBadgeClass(variant: TaskRowItem["badgeVariant"]): string {
  if (variant === "completed") return "bg-emerald-100 text-emerald-800";
  if (variant === "urgent") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

function renderTaskRows(rows: TaskRowItem[]): string {
  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
          Tidak ada tugas yang sesuai dengan filter atau kata kunci pencarian.
        </td>
      </tr>
    `;
  }

  return rows
    .map((task) => {
      const linkHtml = task.submission_link
        ? `<a href="${escapeHtml(task.submission_link)}" target="_blank" rel="noopener noreferrer" class="text-xs font-medium text-blue-600 hover:underline">Buka Link</a>`
        : `<span class="text-xs text-slate-400">-</span>`;

      const assignedText = task.assigned_date ? escapeHtml(task.assigned_date) : "-";
      const lecturerText = task.lecturer_name?.trim()
        ? `Dosen: ${escapeHtml(task.lecturer_name.trim())}`
        : "Dosen: -";
      const semesterText = task.semester?.trim()
        ? `Semester: ${escapeHtml(task.semester.trim())}`
        : "Semester: -";

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="px-4 py-3 align-top min-w-[280px] max-w-md">
            <div class="text-sm font-semibold leading-snug ${
              task.status === "Selesai" ? "line-through text-slate-400" : "text-slate-900"
            }">
              ${escapeHtml(task.task_title)}
            </div>
            <div class="mt-1 text-xs leading-relaxed text-slate-500">
              ${escapeHtml(task.task_desc || "Tanpa deskripsi")}
            </div>
            <div class="mt-1.5 text-[11px] text-slate-400">
              Tanggal Penugasan: ${assignedText}
            </div>
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            <div class="text-xs font-semibold text-slate-800">
              ${escapeHtml(task.course_name)}
            </div>
            <div class="mt-0.5 text-[11px] text-slate-500">
              ${lecturerText}
            </div>
            <div class="text-[11px] text-slate-400">
              ${semesterText}
            </div>
          </td>
          <td class="px-4 py-3 align-top text-xs text-slate-600 whitespace-nowrap">
            ${escapeHtml(task.created_at)}
          </td>
          <td class="px-4 py-3 align-top text-xs font-semibold text-slate-800 whitespace-nowrap">
            ${escapeHtml(task.deadline)}
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getBadgeClass(
              task.badgeVariant
            )}">
              ${escapeHtml(badgeLabelText(task.badgeLabel))}
            </span>
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            ${linkHtml}
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            <div class="flex flex-col gap-1.5 w-28">
              <button
                type="button"
                data-act="toggle"
                data-id="${escapeHtml(task.id)}"
                class="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                ${task.status === "Selesai" ? "Buka Lagi" : "Selesai"}
              </button>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  data-act="edit"
                  data-id="${escapeHtml(task.id)}"
                  class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  data-act="delete"
                  data-id="${escapeHtml(task.id)}"
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function badgeLabelText(label: string): string {
  return label;
}

export function renderTaskTable(props: TaskTableProps): string {
  const { rows, searchKeyword, createdFilter, deadlineFilter, sortField } = props;

  return `
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div class="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
        <input
          type="text"
          id="searchTaskInput"
          placeholder="Cari nama tugas, matkul, deskripsi..."
          value="${escapeHtml(searchKeyword)}"
          class="lg:col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
        />

        <select
          id="createdFilterSelect"
          aria-label="Filter tanggal dibuat"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-none"
        >
          <option value="ALL" ${createdFilter === "ALL" ? "selected" : ""}>Tgl Dibuat: Semua</option>
          <option value="TODAY" ${createdFilter === "TODAY" ? "selected" : ""}>Dibuat Hari Ini</option>
          <option value="LAST_7_DAYS" ${createdFilter === "LAST_7_DAYS" ? "selected" : ""}>7 Hari Terakhir</option>
          <option value="LAST_30_DAYS" ${createdFilter === "LAST_30_DAYS" ? "selected" : ""}>30 Hari Terakhir</option>
        </select>

        <select
          id="deadlineFilterSelect"
          aria-label="Filter tanggal deadline"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-none"
        >
          <option value="ALL" ${deadlineFilter === "ALL" ? "selected" : ""}>Deadline: Semua</option>
          <option value="H7_SOON" ${deadlineFilter === "H7_SOON" ? "selected" : ""}>Mendekati (H-7)</option>
          <option value="TODAY" ${deadlineFilter === "TODAY" ? "selected" : ""}>Deadline Hari Ini</option>
          <option value="OVERDUE" ${deadlineFilter === "OVERDUE" ? "selected" : ""}>Sudah Lewat</option>
        </select>

        <select
          id="sortFieldSelect"
          aria-label="Urutkan tugas"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-none"
        >
          <option value="deadline" ${sortField === "deadline" ? "selected" : ""}>Urut: Tgl Deadline</option>
          <option value="createdAt" ${sortField === "createdAt" ? "selected" : ""}>Urut: Tgl Dibuat</option>
          <option value="title" ${sortField === "title" ? "selected" : ""}>Urut: Nama (A-Z)</option>
        </select>

        <button
          type="button"
          id="resetFiltersBtn"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-2.5">Nama Tugas & Detail</th>
              <th class="px-4 py-2.5">Mata Kuliah</th>
              <th class="px-4 py-2.5">Tanggal Dibuat</th>
              <th class="px-4 py-2.5">Tanggal Deadline</th>
              <th class="px-4 py-2.5">Status</th>
              <th class="px-4 py-2.5">Link Kumpul</th>
              <th class="px-4 py-2.5">Aksi</th>
            </tr>
          </thead>
          <tbody id="taskTableBody">
            ${renderTaskRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export interface TaskTableHandlers {
  onSearchChange: (keyword: string) => void;
  onCreatedFilterChange: (value: string) => void;
  onDeadlineFilterChange: (value: string) => void;
  onSortFieldChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function bindTaskRowActionEvents(
  handlers: Pick<TaskTableHandlers, "onToggleTask" | "onEditTask" | "onDeleteTask">
): void {
  document.querySelectorAll<HTMLButtonElement>("button[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      if (!act || !id) return;

      if (act === "toggle") handlers.onToggleTask(id);
      else if (act === "edit") handlers.onEditTask(id);
      else if (act === "delete") handlers.onDeleteTask(id);
    });
  });
}

export function updateTaskTableBody(
  rows: TaskRowItem[],
  handlers: Pick<TaskTableHandlers, "onToggleTask" | "onEditTask" | "onDeleteTask">
): void {
  const tbody = document.getElementById("taskTableBody");
  if (!tbody) return;
  tbody.innerHTML = renderTaskRows(rows);
  bindTaskRowActionEvents(handlers);
}

export function bindTaskTableEvents(handlers: TaskTableHandlers): void {
  document.getElementById("searchTaskInput")?.addEventListener("input", (e) => {
    handlers.onSearchChange((e.target as HTMLInputElement).value);
  });

  document.getElementById("createdFilterSelect")?.addEventListener("change", (e) => {
    handlers.onCreatedFilterChange((e.target as HTMLSelectElement).value);
  });

  document.getElementById("deadlineFilterSelect")?.addEventListener("change", (e) => {
    handlers.onDeadlineFilterChange((e.target as HTMLSelectElement).value);
  });

  document.getElementById("sortFieldSelect")?.addEventListener("change", (e) => {
    handlers.onSortFieldChange((e.target as HTMLSelectElement).value);
  });

  document.getElementById("resetFiltersBtn")?.addEventListener("click", handlers.onResetFilters);

  bindTaskRowActionEvents(handlers);
}