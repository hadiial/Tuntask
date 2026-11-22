export interface TaskFormValues {
  task_title: string;
  course_name: string;
  task_desc: string;
  assigned_date: string;
  deadline: string;
  submission_link: string;
  status: "Belum Selesai" | "Selesai";
}

export interface ShowTaskModalOptions {
  heading: string;
  showStatusField: boolean;
  values: TaskFormValues;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTaskModal(courseNames: string[]): string {
  return `
    <div
      id="taskModalOverlay"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/45 p-4"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 id="modalHeading" class="text-base font-bold text-slate-900">Tambah Tugas Kuliah</h2>
          <button
            type="button"
            id="closeModalBtn"
            class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form id="taskModalForm" class="space-y-3">
          <div>
            <label for="fTitle" class="mb-1 block text-xs font-semibold text-slate-700">
              Nama Tugas *
            </label>
            <input
              type="text"
              id="fTitle"
              required
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label for="fCourse" class="mb-1 block text-xs font-semibold text-slate-700">
              Mata Kuliah *
            </label>
            <input
              type="text"
              id="fCourse"
              list="courseListOptions"
              required
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
            <datalist id="courseListOptions">
              ${courseNames.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("")}
            </datalist>
          </div>

          <div>
            <label for="fDesc" class="mb-1 block text-xs font-semibold text-slate-700">
              Deskripsi
            </label>
            <textarea
              id="fDesc"
              rows="2"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="fAssigned" class="mb-1 block text-xs font-semibold text-slate-700">
                Tanggal Penugasan
              </label>
              <input
                type="date"
                id="fAssigned"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label for="fDeadline" class="mb-1 block text-xs font-semibold text-slate-700">
                Tanggal Deadline *
              </label>
              <input
                type="date"
                id="fDeadline"
                required
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div id="statusFieldWrapper" class="hidden sm:col-span-2">
              <label for="fStatus" class="mb-1 block text-xs font-semibold text-slate-700">
                Status Tugas
              </label>
              <select
                id="fStatus"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="Belum Selesai">Belum Selesai</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label for="fLink" class="mb-1 block text-xs font-semibold text-slate-700">
              Link Pengumpulan (Opsional)
            </label>
            <input
              type="url"
              id="fLink"
              placeholder="https://..."
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              id="cancelModalBtn"
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

export function showTaskModal(options: ShowTaskModalOptions): void {
  const { heading, showStatusField, values } = options;

  const overlay = document.getElementById("taskModalOverlay");
  const titleEl = document.getElementById("modalHeading");
  const statusWrapper = document.getElementById("statusFieldWrapper");
  const titleInput = document.getElementById("fTitle") as HTMLInputElement | null;
  const courseInput = document.getElementById("fCourse") as HTMLInputElement | null;
  const descInput = document.getElementById("fDesc") as HTMLTextAreaElement | null;
  const assignedInput = document.getElementById("fAssigned") as HTMLInputElement | null;
  const deadlineInput = document.getElementById("fDeadline") as HTMLInputElement | null;
  const linkInput = document.getElementById("fLink") as HTMLInputElement | null;
  const statusInput = document.getElementById("fStatus") as HTMLSelectElement | null;

  if (
    !overlay ||
    !titleEl ||
    !statusWrapper ||
    !titleInput ||
    !courseInput ||
    !descInput ||
    !assignedInput ||
    !deadlineInput ||
    !linkInput ||
    !statusInput
  ) {
    return;
  }

  titleEl.textContent = heading;
  titleInput.value = values.task_title;
  courseInput.value = values.course_name;
  descInput.value = values.task_desc;
  assignedInput.value = values.assigned_date;
  deadlineInput.value = values.deadline;
  linkInput.value = values.submission_link;
  statusInput.value = values.status;

  if (showStatusField) {
    statusWrapper.classList.remove("hidden");
  } else {
    statusWrapper.classList.add("hidden");
  }

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  titleInput.focus();
}

export function hideTaskModal(): void {
  const overlay = document.getElementById("taskModalOverlay");
  overlay?.classList.add("hidden");
  overlay?.classList.remove("flex");
}

export interface TaskModalHandlers {
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export function bindTaskModalEvents(handlers: TaskModalHandlers): void {
  document.getElementById("closeModalBtn")?.addEventListener("click", handlers.onClose);
  document.getElementById("cancelModalBtn")?.addEventListener("click", handlers.onClose);
  document.getElementById("taskModalOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) handlers.onClose();
  });

  document.getElementById("taskModalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const statusWrapper = document.getElementById("statusFieldWrapper");
    const isStatusVisible = statusWrapper ? !statusWrapper.classList.contains("hidden") : false;
    const selectedStatus = (document.getElementById("fStatus") as HTMLSelectElement).value as
      | "Belum Selesai"
      | "Selesai";

    const values: TaskFormValues = {
      task_title: (document.getElementById("fTitle") as HTMLInputElement).value.trim(),
      course_name: (document.getElementById("fCourse") as HTMLInputElement).value.trim(),
      task_desc: (document.getElementById("fDesc") as HTMLTextAreaElement).value.trim(),
      assigned_date: (document.getElementById("fAssigned") as HTMLInputElement).value,
      deadline: (document.getElementById("fDeadline") as HTMLInputElement).value,
      submission_link: (document.getElementById("fLink") as HTMLInputElement).value.trim(),
      status: isStatusVisible ? selectedStatus : "Belum Selesai",
    };

    if (!values.task_title || !values.course_name || !values.deadline) return;
    handlers.onSubmit(values);
  });
}