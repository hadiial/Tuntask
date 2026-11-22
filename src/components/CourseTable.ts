export interface CourseRowItem {
  id: number;
  course_name: string;
  course_code: string | null;
  lecturer_name: string | null;
  semester: string;
  taskCount: number;
}

export interface CourseTableProps {
  rows: CourseRowItem[];
  searchKeyword: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCourseRows(rows: CourseRowItem[]): string {
  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
          Belum ada mata kuliah yang sesuai dengan kata kunci pencarian.
        </td>
      </tr>
    `;
  }

  return rows
    .map((course) => {
      const codeText = course.course_code ? escapeHtml(course.course_code) : "-";
      const lecturerText = course.lecturer_name ? escapeHtml(course.lecturer_name) : "-";

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="px-4 py-3 align-top text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">
            ${codeText}
          </td>
          <td class="px-4 py-3 align-top min-w-[240px]">
            <div class="text-sm font-semibold text-slate-900">
              ${escapeHtml(course.course_name)}
            </div>
          </td>
          <td class="px-4 py-3 align-top text-xs text-slate-700">
            ${lecturerText}
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              ${escapeHtml(course.semester)}
            </span>
          </td>
          <td class="px-4 py-3 align-top text-xs font-semibold text-slate-800 whitespace-nowrap">
            ${course.taskCount} Tugas
          </td>
          <td class="px-4 py-3 align-top whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                data-course-act="edit"
                data-id="${course.id}"
                class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                data-course-act="delete"
                data-id="${course.id}"
                class="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function renderCourseTable(props: CourseTableProps): string {
  const { rows, searchKeyword } = props;

  return `
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div class="mb-4">
        <input
          type="text"
          id="searchCourseInput"
          placeholder="Cari nama mata kuliah, kode, dosen, atau semester..."
          value="${escapeHtml(searchKeyword)}"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-2.5">Kode</th>
              <th class="px-4 py-2.5">Nama Mata Kuliah</th>
              <th class="px-4 py-2.5">Dosen Pengampu</th>
              <th class="px-4 py-2.5">Semester</th>
              <th class="px-4 py-2.5">Jumlah Tugas</th>
              <th class="px-4 py-2.5">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${renderCourseRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export interface CourseTableHandlers {
  onSearchChange: (keyword: string) => void;
  onEditCourse: (id: number) => void;
  onDeleteCourse: (id: number) => void;
}

export function bindCourseTableEvents(handlers: CourseTableHandlers): void {
  document.getElementById("searchCourseInput")?.addEventListener("input", (e) => {
    handlers.onSearchChange((e.target as HTMLInputElement).value);
  });

  document.querySelectorAll<HTMLButtonElement>("button[data-course-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.courseAct;
      const id = Number(btn.dataset.id);
      if (!act || Number.isNaN(id)) return;

      if (act === "edit") handlers.onEditCourse(id);
      else if (act === "delete") handlers.onDeleteCourse(id);
    });
  });
}