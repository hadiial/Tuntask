export interface CourseFormValues {
  course_name: string;
  course_code: string;
  lecturer_name: string;
  semester: string;
}

export interface ShowCourseModalOptions {
  heading: string;
  values: CourseFormValues;
}

export function renderCourseModal(): string {
  return `
    <div
      id="courseModalOverlay"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 id="courseModalHeading" class="text-base font-bold text-slate-900">
            Tambah Mata Kuliah
          </h2>
          <button
            type="button"
            id="closeCourseModalBtn"
            class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form id="courseModalForm" class="space-y-3">
          <div>
            <label for="cName" class="mb-1 block text-xs font-semibold text-slate-700">
              Nama Mata Kuliah *
            </label>
            <input
              type="text"
              id="cName"
              required
              placeholder="Contoh: Pengembangan Aplikasi Web"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="cCode" class="mb-1 block text-xs font-semibold text-slate-700">
                Kode Mata Kuliah (Opsional)
              </label>
              <input
                type="text"
                id="cCode"
                placeholder="Contoh: IF-501"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label for="cSemester" class="mb-1 block text-xs font-semibold text-slate-700">
                Semester *
              </label>
              <input
                type="text"
                id="cSemester"
                required
                placeholder="Contoh: 2026 Ganjil"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label for="cLecturer" class="mb-1 block text-xs font-semibold text-slate-700">
              Dosen Pengampu (Opsional)
            </label>
            <input
              type="text"
              id="cLecturer"
              placeholder="Nama dosen pengampu"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              id="cancelCourseModalBtn"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function showCourseModal(options: ShowCourseModalOptions): void {
  const { heading, values } = options;

  const overlay = document.getElementById("courseModalOverlay");
  const titleEl = document.getElementById("courseModalHeading");
  const nameInput = document.getElementById("cName") as HTMLInputElement | null;
  const codeInput = document.getElementById("cCode") as HTMLInputElement | null;
  const lecturerInput = document.getElementById("cLecturer") as HTMLInputElement | null;
  const semesterInput = document.getElementById("cSemester") as HTMLInputElement | null;

  if (!overlay || !titleEl || !nameInput || !codeInput || !lecturerInput || !semesterInput) {
    return;
  }

  titleEl.textContent = heading;
  nameInput.value = values.course_name;
  codeInput.value = values.course_code;
  lecturerInput.value = values.lecturer_name;
  semesterInput.value = values.semester;

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  nameInput.focus();
}

export function hideCourseModal(): void {
  const overlay = document.getElementById("courseModalOverlay");
  overlay?.classList.add("hidden");
  overlay?.classList.remove("flex");
}

export interface CourseModalHandlers {
  onClose: () => void;
  onSubmit: (values: CourseFormValues) => void;
}

export function bindCourseModalEvents(handlers: CourseModalHandlers): void {
  document.getElementById("closeCourseModalBtn")?.addEventListener("click", handlers.onClose);
  document.getElementById("cancelCourseModalBtn")?.addEventListener("click", handlers.onClose);
  document.getElementById("courseModalOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) handlers.onClose();
  });

  document.getElementById("courseModalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const values: CourseFormValues = {
      course_name: (document.getElementById("cName") as HTMLInputElement).value.trim(),
      course_code: (document.getElementById("cCode") as HTMLInputElement).value.trim(),
      lecturer_name: (document.getElementById("cLecturer") as HTMLInputElement).value.trim(),
      semester: (document.getElementById("cSemester") as HTMLInputElement).value.trim(),
    };

    if (!values.course_name || !values.semester) return;
    handlers.onSubmit(values);
  });
}