import "./style.css";
import { renderDrawer, bindDrawerEvents, type DrawerMenu } from "./components/Drawer";
import { renderTopBar, bindTopBarEvents } from "./components/TopBar";
import { renderPageHeader, bindPageHeaderEvents } from "./components/PageHeader";
import { renderStatCardsGrid, bindStatCardsEvents, type StatCardItem } from "./components/StatCard";
import { renderTaskTable, bindTaskTableEvents, type TaskRowItem } from "./components/TaskTable";
import { renderTaskModal, showTaskModal, hideTaskModal, bindTaskModalEvents, type TaskFormValues } from "./components/TaskModal";
import { renderCoursePage, bindCoursePageEvents, createInitialCoursePageState, type CoursePageState } from "./course";
import { renderProfilePage, bindProfilePageEvents, createInitialProfilePageState, type ProfilePageState } from "./profile";
import { renderLoginPage, bindLoginPageEvents } from "./login";
import { renderRegisterPage, bindRegisterPageEvents } from "./register";
import { renderAlertPopup, showAlertPopup, bindAlertPopupEvents } from "./components/AlertPopup";
import type { CourseFormValues } from "./components/CourseModal";
import {
  loginStudent,
  registerStudent,
  updateStudentProfile,
  verifyStudentPassword,
  changeStudentPassword,
  fetchCourses,
  createCourse,
  updateCourse,
  removeCourse,
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  removeTask,
} from "./api";

// ==========================================
// TIPE DATA TYPESCRIPT
// ==========================================

export type TaskStatus = "Belum Selesai" | "Selesai" | "Terlambat";
export type CreatedFilter = "ALL" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS";
export type DeadlineFilter = "ALL" | "H7_SOON" | "OVERDUE" | "TODAY";
export type SortField = "deadline" | "createdAt" | "title";
export type QuickCardFilter = "ALL" | "PENDING" | "H7_DEADLINE" | "COMPLETED";
export type AuthScreen = "login" | "register";

type PendingTaskAction =
  | { type: "toggle"; taskId: string | number }
  | { type: "delete"; taskId: string | number };

export interface Student {
  id: number;
  nim: string;
  full_name: string;
  major: string;
  faculty: string;
  university: string;
}

export interface Course {
  id: number;
  student_id?: number;
  course_name: string;
  course_code: string | null;
  lecturer_name: string | null;
  semester: string;
}

export interface TaskRecord {
  id: number | string;
  student_id: number;
  course_id: number;
  course_name: string;
  task_title: string;
  task_desc: string;
  assigned_date: string;
  created_at: string;
  deadline: string;
  submission_link: string;
  status: TaskStatus;
}

export interface DashboardSummary {
  total: number;
  uncompleted: number;
  dueSoonH7: number;
  completed: number;
}

export class DataCollection<T extends { id: string | number }> {
  private items: T[];

  constructor(initialItems: T[] = []) {
    this.items = initialItems;
  }

  getAll(): T[] {
    return this.items;
  }

  setAll(nextItems: T[]): void {
    this.items = nextItems;
  }

  findById(id: string | number): T | undefined {
    return this.items.find((item) => String(item.id) === String(id));
  }
}

// ==========================================
// ENVIRONMENT VARIABLES & STATE APLIKASI
// ==========================================

const APP_NAME: string = import.meta.env.VITE_APP_NAME || "Tuntask";
const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || "1.0.0";
const LOGOUT_CONFIRM_ID = "logoutConfirmPopup";
const TASK_CONFIRM_ID = "taskActionConfirmPopup";
const API_ERROR_POPUP_ID = "apiErrorPopup";

let isAuthenticated = false;
let authScreen: AuthScreen = "login";
let currentStudent: Student = {
  id: 0,
  nim: "",
  full_name: "",
  major: "",
  faculty: "",
  university: "",
};

const courseCollection = new DataCollection<Course>([]);
const taskCollection = new DataCollection<TaskRecord>([]);

let isDrawerOpen = true;
let activeMenu: DrawerMenu = "dashboard";

// State halaman Dashboard
let activeCardFilter: QuickCardFilter = "ALL";
let searchKeyword = "";
let createdFilter: CreatedFilter = "ALL";
let deadlineFilter: DeadlineFilter = "ALL";
let sortField: SortField = "deadline";
let editingTaskId: string | number | null = null;
let pendingTaskAction: PendingTaskAction | null = null;

// State halaman Mata Kuliah & Profil
let coursePageState: CoursePageState = createInitialCoursePageState();
let profilePageState: ProfilePageState = createInitialProfilePageState();

function notifyError(message: string): void {
  showAlertPopup(API_ERROR_POPUP_ID, message);
}

async function syncStudentWorkspace(studentId: number): Promise<void> {
  const [coursesRes, tasksRes] = await Promise.all([
    fetchCourses(studentId),
    fetchTasks(studentId),
  ]);

  if (coursesRes.ok && coursesRes.data) {
    courseCollection.setAll(coursesRes.data);
  } else if (coursesRes.message) {
    notifyError(coursesRes.message);
  }

  if (tasksRes.ok && tasksRes.data) {
    taskCollection.setAll(tasksRes.data);
  } else if (tasksRes.message) {
    notifyError(tasksRes.message);
  }
}

// ==========================================
// HELPER TANGGAL, DEADLINE H-7 & TRANSFORM DATA
// ==========================================

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDateOnly(value: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function getDaysUntilDeadline(deadlineStr: string): number {
  const clean = normalizeDateOnly(deadlineStr);
  if (!clean) return 9999;
  const today = new Date(`${getTodayDateString()}T00:00:00`);
  const target = new Date(`${clean}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysSinceCreated(createdStr: string): number {
  const clean = normalizeDateOnly(createdStr);
  if (!clean) return 9999;
  const today = new Date(`${getTodayDateString()}T00:00:00`);
  const created = new Date(`${clean}T00:00:00`);
  return Math.round((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

function isDueWithinH7(task: TaskRecord): boolean {
  if (task.status === "Selesai") return false;
  const daysLeft = getDaysUntilDeadline(task.deadline);
  return daysLeft >= 0 && daysLeft <= 7;
}

function computeDashboardSummary(tasks: TaskRecord[]): DashboardSummary {
  return {
    total: tasks.length,
    uncompleted: tasks.filter((t) => t.status !== "Selesai").length,
    dueSoonH7: tasks.filter((t) => isDueWithinH7(t)).length,
    completed: tasks.filter((t) => t.status === "Selesai").length,
  };
}

function buildDashboardCards(summary: DashboardSummary): StatCardItem[] {
  return [
    {
      id: "ALL",
      label: "Total Tugas",
      value: summary.total,
      description: "Seluruh tugas tercatat",
      dotClass: "bg-blue-600",
      valueClass: "text-slate-900",
      isActive: activeCardFilter === "ALL",
    },
    {
      id: "PENDING",
      label: "Tugas Belum Selesai",
      value: summary.uncompleted,
      description: "Perlu dikerjakan",
      dotClass: "bg-amber-500",
      valueClass: "text-amber-600",
      isActive: activeCardFilter === "PENDING",
    },
    {
      id: "H7_DEADLINE",
      label: "Mendekati Deadline (H-7)",
      value: summary.dueSoonH7,
      description: "Jatuh tempo 0–7 hari lagi",
      dotClass: "bg-red-600",
      valueClass: "text-red-600",
      isActive: activeCardFilter === "H7_DEADLINE",
    },
    {
      id: "COMPLETED",
      label: "Tugas Sudah Selesai",
      value: summary.completed,
      description: "Telah dituntaskan",
      dotClass: "bg-emerald-600",
      valueClass: "text-emerald-600",
      isActive: activeCardFilter === "COMPLETED",
    },
  ];
}

function getFilteredTaskRows(): TaskRowItem[] {
  const q = searchKeyword.trim().toLowerCase();

  const filtered = taskCollection.getAll().filter((task) => {
    if (activeCardFilter === "PENDING" && task.status === "Selesai") return false;
    if (activeCardFilter === "H7_DEADLINE" && !isDueWithinH7(task)) return false;
    if (activeCardFilter === "COMPLETED" && task.status !== "Selesai") return false;

    if (q.length > 0) {
      const hay = `${task.task_title} ${task.course_name} ${task.task_desc ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    const ageDays = getDaysSinceCreated(task.created_at);
    if (createdFilter === "TODAY" && ageDays !== 0) return false;
    if (createdFilter === "LAST_7_DAYS" && (ageDays < 0 || ageDays > 7)) return false;
    if (createdFilter === "LAST_30_DAYS" && (ageDays < 0 || ageDays > 30)) return false;

    const daysLeft = getDaysUntilDeadline(task.deadline);
    if (deadlineFilter === "H7_SOON" && !(daysLeft >= 0 && daysLeft <= 7)) return false;
    if (deadlineFilter === "OVERDUE" && !(daysLeft < 0 && task.status !== "Selesai")) return false;
    if (deadlineFilter === "TODAY" && daysLeft !== 0) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "title") return a.task_title.localeCompare(b.task_title, "id");
    if (sortField === "createdAt") {
      return normalizeDateOnly(b.created_at).localeCompare(normalizeDateOnly(a.created_at));
    }
    return normalizeDateOnly(a.deadline).localeCompare(normalizeDateOnly(b.deadline));
  });

  return sorted.map((task): TaskRowItem => {
    const normalized: TaskRecord = {
      ...task,
      id: String(task.id),
      task_desc: task.task_desc ?? "",
      assigned_date: normalizeDateOnly(task.assigned_date),
      created_at: normalizeDateOnly(task.created_at),
      deadline: normalizeDateOnly(task.deadline),
      submission_link: task.submission_link ?? "",
    };

    const daysLeft = getDaysUntilDeadline(normalized.deadline);
    const isH7 = isDueWithinH7(normalized);
    const rowStatus: TaskRowItem["status"] =
      normalized.status === "Selesai" ? "Selesai" : "Belum Selesai";

    if (normalized.status === "Selesai") {
      return {
        ...normalized,
        id: String(normalized.id),
        status: rowStatus,
        badgeLabel: "Selesai",
        badgeVariant: "completed",
      };
    }
    if (isH7) {
      return {
        ...normalized,
        id: String(normalized.id),
        status: rowStatus,
        badgeLabel: daysLeft === 0 ? "Deadline Hari Ini" : `H-${daysLeft} Deadline`,
        badgeVariant: "urgent",
      };
    }
    if (daysLeft < 0) {
      return {
        ...normalized,
        id: String(normalized.id),
        status: rowStatus,
        badgeLabel: `Terlambat (${Math.abs(daysLeft)}h)`,
        badgeVariant: "urgent",
      };
    }
    return {
      ...normalized,
      id: String(normalized.id),
      status: rowStatus,
      badgeLabel: normalized.status,
      badgeVariant: "pending",
    };
  });
}

// ==========================================
// OPERASI CRUD TUGAS & MATA KULIAH VIA API
// ==========================================

function openTaskModal(taskId?: string | number): void {
  editingTaskId = taskId ?? null;
  const existing = taskId !== undefined ? taskCollection.findById(taskId) : undefined;
  const today = getTodayDateString();

  if (existing) {
    showTaskModal({
      heading: "Edit Tugas Kuliah",
      showStatusField: true,
      values: {
        task_title: existing.task_title,
        course_name: existing.course_name,
        task_desc: existing.task_desc ?? "",
        assigned_date: normalizeDateOnly(existing.assigned_date),
        deadline: normalizeDateOnly(existing.deadline),
        submission_link: existing.submission_link ?? "",
        status: existing.status === "Selesai" ? "Selesai" : "Belum Selesai",
      },
    });
  } else {
    showTaskModal({
      heading: "Tambah Tugas Kuliah",
      showStatusField: false,
      values: {
        task_title: "",
        course_name: courseCollection.getAll()[0]?.course_name || "",
        task_desc: "",
        assigned_date: today,
        deadline: "",
        submission_link: "",
        status: "Belum Selesai",
      },
    });
  }
}

async function resolveCourseId(courseName: string): Promise<number | null> {
  const matched = courseCollection
    .getAll()
    .find((c) => c.course_name.toLowerCase() === courseName.toLowerCase());
  if (matched) return matched.id;

  const created = await createCourse(currentStudent.id, {
    course_name: courseName,
    course_code: "",
    lecturer_name: "",
    semester: "2026 Ganjil",
  });

  if (!created.ok || !created.data) {
    notifyError(created.message || "Gagal membuat mata kuliah baru.");
    return null;
  }

  courseCollection.setAll([...courseCollection.getAll(), created.data]);
  return created.data.id;
}

async function saveTask(values: TaskFormValues): Promise<void> {
  const courseId = await resolveCourseId(values.course_name);
  if (courseId === null) return;

  if (editingTaskId !== null) {
    const res = await updateTask(editingTaskId, { course_id: courseId, values });
    if (!res.ok || !res.data) {
      notifyError(res.message || "Gagal memperbarui tugas.");
      return;
    }

    taskCollection.setAll(
      taskCollection.getAll().map((item) =>
        String(item.id) === String(editingTaskId) ? res.data! : item
      )
    );
  } else {
    const res = await createTask({
      student_id: currentStudent.id,
      course_id: courseId,
      values,
    });
    if (!res.ok || !res.data) {
      notifyError(res.message || "Gagal menambahkan tugas.");
      return;
    }

    taskCollection.setAll([res.data, ...taskCollection.getAll()]);
  }

  editingTaskId = null;
  hideTaskModal();
  renderView();
}

function requestToggleTaskStatus(taskId: string | number): void {
  const target = taskCollection.findById(taskId);
  if (!target) return;

  const isReopening = target.status === "Selesai";
  pendingTaskAction = { type: "toggle", taskId };

  showAlertPopup(
    TASK_CONFIRM_ID,
    isReopening
      ? `Apakah kamu yakin ingin membuka kembali tugas "${target.task_title}"?`
      : `Apakah kamu yakin ingin menandai tugas "${target.task_title}" sebagai selesai?`
  );
}

function requestDeleteTask(taskId: string | number): void {
  const target = taskCollection.findById(taskId);
  if (!target) return;

  pendingTaskAction = { type: "delete", taskId };
  showAlertPopup(
    TASK_CONFIRM_ID,
    `Apakah kamu yakin ingin menghapus tugas "${target.task_title}"?`
  );
}

async function executePendingTaskAction(): Promise<void> {
  if (!pendingTaskAction) return;

  if (pendingTaskAction.type === "toggle") {
    const targetId = pendingTaskAction.taskId;
    const target = taskCollection.findById(targetId);
    if (!target) {
      pendingTaskAction = null;
      return;
    }

    const nextStatus: TaskStatus =
      target.status === "Selesai" ? "Belum Selesai" : "Selesai";
    const res = await updateTaskStatus(targetId, nextStatus);
    pendingTaskAction = null;

    if (!res.ok) {
      notifyError(res.message || "Gagal mengubah status tugas.");
      return;
    }

    taskCollection.setAll(
      taskCollection.getAll().map((item) =>
        String(item.id) === String(targetId) ? { ...item, status: nextStatus } : item
      )
    );
    renderView();
  } else if (pendingTaskAction.type === "delete") {
    const targetId = pendingTaskAction.taskId;
    const res = await removeTask(targetId);
    pendingTaskAction = null;

    if (!res.ok) {
      notifyError(res.message || "Gagal menghapus tugas.");
      return;
    }

    taskCollection.setAll(
      taskCollection.getAll().filter((item) => String(item.id) !== String(targetId))
    );
    renderView();
  }
}

async function saveCourse(
  values: CourseFormValues,
  editingCourseId: number | null
): Promise<void> {
  if (editingCourseId !== null) {
    const res = await updateCourse(currentStudent.id, editingCourseId, values);
    if (!res.ok || !res.data) {
      notifyError(res.message || "Gagal mengubah mata kuliah.");
      return;
    }

    courseCollection.setAll(
      courseCollection.getAll().map((item) =>
        item.id === editingCourseId ? res.data! : item
      )
    );
    taskCollection.setAll(
      taskCollection.getAll().map((task) =>
        task.course_id === editingCourseId
          ? { ...task, course_name: res.data!.course_name }
          : task
      )
    );
  } else {
    const res = await createCourse(currentStudent.id, values);
    if (!res.ok || !res.data) {
      notifyError(res.message || "Gagal menambah mata kuliah.");
      return;
    }

    courseCollection.setAll([...courseCollection.getAll(), res.data]);
  }

  renderView();
}

async function deleteCourse(courseId: number): Promise<void> {
  const res = await removeCourse(currentStudent.id, courseId);
  if (!res.ok) {
    notifyError(res.message || "Gagal menghapus mata kuliah.");
    return;
  }

  courseCollection.setAll(
    courseCollection.getAll().filter((item) => item.id !== courseId)
  );
  taskCollection.setAll(
    taskCollection.getAll().filter((task) => task.course_id !== courseId)
  );
  renderView();
}

// ==========================================
// RENDER & EVENT BINDING
// ==========================================

function renderDashboardBody(): string {
  const summary = computeDashboardSummary(taskCollection.getAll());
  const statCards = buildDashboardCards(summary);
  const taskRows = getFilteredTaskRows();
  const courseNames = courseCollection.getAll().map((c) => c.course_name);

  return `
    ${renderPageHeader({
      title: "Dashboard",
      subtitle: `${currentStudent.major} — ${currentStudent.university}`,
      actionLabel: "+ Tambah Tugas",
    })}

    ${renderStatCardsGrid(statCards)}

    ${renderTaskTable({
      rows: taskRows,
      searchKeyword,
      createdFilter,
      deadlineFilter,
      sortField,
    })}

    ${renderTaskModal(courseNames)}
    ${renderAlertPopup({
      id: TASK_CONFIRM_ID,
      title: "Konfirmasi Aksi Tugas",
      message: "Apakah kamu yakin ingin melanjutkan aksi pada tugas ini?",
      confirmLabel: "Ya, Lanjutkan",
      cancelLabel: "Batal",
    })}
  `;
}

function renderView(): void {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;

  if (!isAuthenticated) {
    root.innerHTML = `
      ${
        authScreen === "login"
          ? renderLoginPage(APP_NAME)
          : renderRegisterPage(APP_NAME)
      }
      ${renderAlertPopup({
        id: API_ERROR_POPUP_ID,
        title: "Peringatan Sistem",
        message: "Terjadi kesalahan saat menghubungi server.",
        confirmLabel: "Mengerti",
      })}
    `;
    bindAlertPopupEvents(API_ERROR_POPUP_ID, {});
    attachAuthListeners();
    return;
  }

  let pageBody = "";
  if (activeMenu === "dashboard") {
    pageBody = renderDashboardBody();
  } else if (activeMenu === "courses") {
    pageBody = renderCoursePage(
      courseCollection.getAll(),
      taskCollection.getAll(),
      coursePageState
    );
  } else {
    pageBody = renderProfilePage(currentStudent, profilePageState);
  }

  root.innerHTML = `
    <div class="flex min-h-screen bg-slate-50 text-slate-800">
      ${renderDrawer({
        appName: APP_NAME,
        appVersion: APP_VERSION,
        isOpen: isDrawerOpen,
        activeMenu,
      })}

      <div class="flex min-w-0 flex-1 flex-col">
        ${renderTopBar({
          appName: APP_NAME,
          dateLabel: getTodayDateString(),
          studentName: currentStudent.full_name,
          studentNim: currentStudent.nim,
        })}

        <main class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
          ${pageBody}
        </main>
      </div>
    </div>

    ${renderAlertPopup({
      id: LOGOUT_CONFIRM_ID,
      title: "Konfirmasi Logout",
      message: "Apakah kamu yakin ingin keluar dari akun Tuntask?",
      confirmLabel: "Ya, Logout",
      cancelLabel: "Batal",
    })}

    ${renderAlertPopup({
      id: API_ERROR_POPUP_ID,
      title: "Peringatan Sistem",
      message: "Terjadi kesalahan saat menghubungi server.",
      confirmLabel: "Mengerti",
    })}
  `;

  attachAppListeners();
}

function attachAuthListeners(): void {
  if (authScreen === "login") {
    bindLoginPageEvents({
      onLoginSuccess: ({ nim, password }) => {
        void (async () => {
          const res = await loginStudent({ nim, password });
          if (!res.ok || !res.data) {
            notifyError(res.message || "NIM atau password salah.");
            return;
          }

          currentStudent = res.data;
          await syncStudentWorkspace(res.data.id);
          isAuthenticated = true;
          activeMenu = "dashboard";
          renderView();
        })();
        return true;
      },
      onGoToRegister: () => {
        isAuthenticated = false;
        authScreen = "register";
        renderView();
      },
    });
  } else {
    bindRegisterPageEvents({
      onRegisterSubmit: (payload) => {
        void (async () => {
          const res = await registerStudent(payload);
          if (!res.ok) {
            notifyError(res.message || "Peringatan: Gagal mendaftarkan akun.");
            return;
          }

          isAuthenticated = false;
          authScreen = "login";
          renderView();
        })();
        return { ok: true };
      },
      onGoToLogin: () => {
        isAuthenticated = false;
        authScreen = "login";
        renderView();
      },
    });
  }
}

function attachAppListeners(): void {
  bindAlertPopupEvents(API_ERROR_POPUP_ID, {});

  bindTopBarEvents(() => {
    isDrawerOpen = !isDrawerOpen;
    renderView();
  });

  bindDrawerEvents({
    onClose: () => {
      isDrawerOpen = false;
      renderView();
    },
    onSelectMenu: (menu) => {
      activeMenu = menu;
      if (window.innerWidth < 1024) {
        isDrawerOpen = false;
      }
      renderView();
    },
    onLogout: () => {
      showAlertPopup(LOGOUT_CONFIRM_ID);
    },
  });

  bindAlertPopupEvents(LOGOUT_CONFIRM_ID, {
    onConfirm: () => {
      isAuthenticated = false;
      authScreen = "login";
      courseCollection.setAll([]);
      taskCollection.setAll([]);
      renderView();
    },
  });

  if (activeMenu === "dashboard") {
    bindPageHeaderEvents(() => openTaskModal());

    bindStatCardsEvents<QuickCardFilter>((filter) => {
      activeCardFilter = filter;
      renderView();
    });

    bindTaskTableEvents({
      onSearchChange: (keyword) => {
        searchKeyword = keyword;
        renderView();
      },
      onCreatedFilterChange: (value) => {
        createdFilter = value as CreatedFilter;
        renderView();
      },
      onDeadlineFilterChange: (value) => {
        deadlineFilter = value as DeadlineFilter;
        renderView();
      },
      onSortFieldChange: (value) => {
        sortField = value as SortField;
        renderView();
      },
      onResetFilters: () => {
        activeCardFilter = "ALL";
        searchKeyword = "";
        createdFilter = "ALL";
        deadlineFilter = "ALL";
        sortField = "deadline";
        renderView();
      },
      onToggleTask: requestToggleTaskStatus,
      onEditTask: (id) => openTaskModal(id),
      onDeleteTask: requestDeleteTask,
    });

    bindTaskModalEvents({
      onClose: () => {
        editingTaskId = null;
        hideTaskModal();
      },
      onSubmit: (values) => {
        void saveTask(values);
      },
    });

    bindAlertPopupEvents(TASK_CONFIRM_ID, {
      onConfirm: () => {
        void executePendingTaskAction();
      },
      onCancel: () => {
        pendingTaskAction = null;
      },
    });
  } else if (activeMenu === "courses") {
    bindCoursePageEvents(courseCollection.getAll(), coursePageState, {
      onChangeState: (updater) => {
        coursePageState = updater(coursePageState);
        renderView();
      },
      onAddCourse: (values, editingId) => {
        void saveCourse(values, editingId);
      },
      onDeleteCourse: (courseId) => {
        void deleteCourse(courseId);
      },
    });
  } else {
    bindProfilePageEvents({
      onChangeState: (updater) => {
        profilePageState = updater(profilePageState);
        renderView();
      },
      onSaveProfile: (updated) => {
        void (async () => {
          const res = await updateStudentProfile(currentStudent.id, updated);
          if (!res.ok || !res.data) {
            notifyError(res.message || "Gagal memperbarui profil.");
            return;
          }
          currentStudent = res.data;
          renderView();
        })();
      },
      onVerifyOldPassword: (oldPassword) =>
        verifyStudentPassword(currentStudent.id, oldPassword),
      onConfirmChangePassword: (payload) => {
        void (async () => {
          const res = await changeStudentPassword(currentStudent.id, payload);
          if (!res.ok) {
            notifyError(res.message || "Gagal mengganti password.");
          }
        })();
      },
    });
  }
}

// ==========================================
// STARTUP
// ==========================================

renderView();