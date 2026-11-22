import type { Student } from "../main";

export type ProfileEditableFields = Omit<Student, "id">;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\x22/g, "&quot;");
}

export function renderProfileForm(student: Student): string {
  return `
    <form id="profileEditForm" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="pFullName" class="mb-1 block text-xs font-semibold text-slate-700">
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="pFullName"
            required
            value="${escapeHtml(student.full_name)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="pNim" class="mb-1 block text-xs font-semibold text-slate-700">
            NIM *
          </label>
          <input
            type="text"
            id="pNim"
            required
            value="${escapeHtml(student.nim)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="pMajor" class="mb-1 block text-xs font-semibold text-slate-700">
            Jurusan *
          </label>
          <input
            type="text"
            id="pMajor"
            required
            value="${escapeHtml(student.major)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="pFaculty" class="mb-1 block text-xs font-semibold text-slate-700">
            Fakultas *
          </label>
          <input
            type="text"
            id="pFaculty"
            required
            value="${escapeHtml(student.faculty)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div class="sm:col-span-2">
          <label for="pUniversity" class="mb-1 block text-xs font-semibold text-slate-700">
            Universitas *
          </label>
          <input
            type="text"
            id="pUniversity"
            required
            value="${escapeHtml(student.university)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          id="cancelEditProfileBtn"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          class="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  `;
}

export interface ProfileFormHandlers {
  onCancel: () => void;
  onSubmit: (values: ProfileEditableFields) => void;
}

export function bindProfileFormEvents(handlers: ProfileFormHandlers): void {
  document.getElementById("cancelEditProfileBtn")?.addEventListener("click", handlers.onCancel);

  document.getElementById("profileEditForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const full_name = (document.getElementById("pFullName") as HTMLInputElement).value.trim();
    const nim = (document.getElementById("pNim") as HTMLInputElement).value.trim();
    const major = (document.getElementById("pMajor") as HTMLInputElement).value.trim();
    const faculty = (document.getElementById("pFaculty") as HTMLInputElement).value.trim();
    const university = (document.getElementById("pUniversity") as HTMLInputElement).value.trim();

    if (!full_name || !nim || !major || !faculty || !university) return;

    handlers.onSubmit({ full_name, nim, major, faculty, university });
  });
}