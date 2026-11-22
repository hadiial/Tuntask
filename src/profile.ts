import { renderPageHeader, bindPageHeaderEvents } from "./components/PageHeader";
import {
  renderProfileForm,
  bindProfileFormEvents,
  type ProfileEditableFields,
} from "./components/ProfileForm";
import {
  renderChangePasswordModal,
  openChangePasswordModal,
  bindChangePasswordModalEvents,
  type ChangePasswordPayload,
} from "./components/ChangePasswordModal";
import type { Student } from "./main";

export type { ChangePasswordPayload };

export interface ProfilePageState {
  isEditing: boolean;
}

export interface ProfilePageActions {
  onChangeState: (updater: (prev: ProfilePageState) => ProfilePageState) => void;
  onSaveProfile: (updated: ProfileEditableFields) => void;
  onVerifyOldPassword: (oldPassword: string) => boolean;
  onConfirmChangePassword: (payload: ChangePasswordPayload) => void;
}

export function createInitialProfilePageState(): ProfilePageState {
  return { isEditing: false };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\x22/g, "&quot;");
}

function renderProfileField(label: string, value: string): string {
  return `
    <div class="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        ${escapeHtml(label)}
      </div>
      <div class="mt-1 text-sm font-semibold text-slate-900">
        ${escapeHtml(value)}
      </div>
    </div>
  `;
}

export function renderProfilePage(student: Student, state: ProfilePageState): string {
  const initial = student.full_name.trim().charAt(0).toUpperCase() || "M";

  const bodySection = state.isEditing
    ? renderProfileForm(student)
    : `
      <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        ${renderProfileField("Nama Lengkap", student.full_name)}
        ${renderProfileField("NIM", student.nim)}
        ${renderProfileField("Jurusan", student.major)}
        ${renderProfileField("Fakultas", student.faculty)}
        <div class="sm:col-span-2">
          ${renderProfileField("Universitas", student.university)}
        </div>
      </div>
    `;

  return `
    ${renderPageHeader({
      title: "Profil Mahasiswa",
      subtitle: "Informasi identitas akademik mahasiswa terdaftar",
      actionLabel: state.isEditing ? "Batal Edit" : "Edit Profil",
    })}

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div class="mb-6 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
        <div class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
          ${escapeHtml(initial)}
        </div>
        <div class="min-w-0">
          <h2 class="truncate text-lg font-bold text-slate-900">
            ${escapeHtml(student.full_name)}
          </h2>
          <p class="text-xs font-medium text-slate-500">
            NIM ${escapeHtml(student.nim)} · ${escapeHtml(student.major)}
          </p>
        </div>
      </div>

      ${bodySection}

      <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span
          id="passwordUpdatedFeedback"
          class="hidden text-xs font-semibold text-emerald-700"
        >
          Password berhasil diperbarui.
        </span>
        <button
          type="button"
          id="openChangePasswordBtn"
          class="ml-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          Ganti Password
        </button>
      </div>
    </section>

    ${renderChangePasswordModal()}
  `;
}

export function bindProfilePageEvents(actions: ProfilePageActions): void {
  bindPageHeaderEvents(() => {
    actions.onChangeState((prev) => ({ isEditing: !prev.isEditing }));
  });

  bindProfileFormEvents({
    onCancel: () => actions.onChangeState(() => ({ isEditing: false })),
    onSubmit: (values) => {
      actions.onSaveProfile(values);
      actions.onChangeState(() => ({ isEditing: false }));
    },
  });

  document
    .getElementById("openChangePasswordBtn")
    ?.addEventListener("click", () => openChangePasswordModal());

  bindChangePasswordModalEvents({
    onVerifyOldPassword: actions.onVerifyOldPassword,
    onConfirmChange: actions.onConfirmChangePassword,
  });
}