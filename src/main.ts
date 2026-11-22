import "./style.css";
import { renderDrawer, bindDrawerEvents, type DrawerMenu } from "./components/Drawer";
import { renderTopBar, bindTopBarEvents } from "./components/TopBar";
import { renderPageHeader, bindPageHeaderEvents } from "./components/PageHeader";
import { renderStatCardsGrid, bindStatCardsEvents, type StatCardItem,} from "./components/StatCard";
import { renderTaskTable, bindTaskTableEvents, type TaskRowItem,} from "./components/TaskTable";
import { renderTaskModal, showTaskModal, hideTaskModal, bindTaskModalEvents, type TaskFormValues,} from "./components/TaskModal";
import { renderCoursePage, bindCoursePageEvents, createInitialCoursePageState, type CoursePageState,} from "./course";
import { renderProfilePage, bindProfilePageEvents, createInitialProfilePageState, type ProfilePageState,} from "./profile";
import type { CourseFormValues } from "./components/CourseModal";

// ==========================================
// TIPE DATA TYPESCRIPT
// ==========================================

export type TaskStatus = "Belum Selesai" | "Selesai";
export type CreatedFilter = "ALL" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS";
export type DeadlineFilter = "ALL" | "H7_SOON" | "OVERDUE" | "TODAY";
export type SortField = "deadline" | "createdAt" | "title";
export type QuickCardFilter = "ALL" | "PENDING" | "H7_DEADLINE" | "COMPLETED";

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
  course_name: string;
  course_code: string | null;
  lecturer_name: string | null;
  semester: string;
}

export interface TaskRecord {
  id: string;
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
    return this.items.find((item) => item.id === id);
  }
}

let currentPassword = "12345678";

// ==========================================
// ENVIRONMENT VARIABLES & STATE IN-MEMORY
// ==========================================

const APP_NAME: string = import.meta.env.VITE_APP_NAME || "Tuntask";
const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || "1.0.0";

const todayStr = getTodayDateString();

let currentStudent: Student = {
  id: 1,
  nim: "1247050065",
  full_name: "Salman Hadi Al Ghifari",
  major: "Teknik Informatika",
  faculty: "Sains dan Teknologi",
  university: "UIN Sunan Gunung Djati Bandung",
};

const SEED_COURSES: Course[] = [
  {
    id: 1,
    course_name: "Pengembangan Aplikasi Web",
    course_code: "IF-501",
    lecturer_name: "Dosen Pengampu PABW",
    semester: "2026 Ganjil",
  },
  {
    id: 2,
    course_name: "Manajemen Basis Data",
    course_code: "IF-502",
    lecturer_name: "Wildan Budiawan Zulfikar, S.T., M.Kom.",
    semester: "2026 Ganjil",
  },
  {
    id: 3,
    course_name: "Jaringan Komputer",
    course_code: "IF-503",
    lecturer_name: "Cecep Nurul Alam, M.T.",
    semester: "2026 Ganjil",
  },
];

const SEED_TASKS: TaskRecord[] = [
  {
    id: "task-1",
    student_id: currentStudent.id,
    course_id: 1,
    course_name: "Pengembangan Aplikasi Web",
    task_title: "Implementasi CRUD TypeScript & Git Workflow",
    task_desc:
      "Buat aplikasi tugas kuliah di Vite + TS, minimal 5 commit, 2 branch, PR, dan merge conflict.",
    assigned_date: "2026-11-18",
    created_at: "2026-11-20",
    deadline: "2026-11-25",
    submission_link: "https://github.com/hadiial/Tuntask",
    status: "Belum Selesai",
  },
  {
    id: "task-2",
    student_id: currentStudent.id,
    course_id: 2,
    course_name: "Manajemen Basis Data",
    task_title: "Normalisasi ERD Oracle & Skema Tabel MySQL",
    task_desc: "Susun ERD entitas students, courses, tasks lalu buat skema di MySQL.",
    assigned_date: "2026-11-16",
    created_at: "2026-11-17",
    deadline: "2026-11-28",
    submission_link: "",
    status: "Belum Selesai",
  },
  {
    id: "task-3",
    student_id: currentStudent.id,
    course_id: 3,
    course_name: "Jaringan Komputer",
    task_title: "Konfigurasi OSPF & VLAN Topologi Kampus",
    task_desc: "Topologi multi-router dan pengujian konektivitas antar subnet.",
    assigned_date: "2026-11-10",
    created_at: "2026-11-12",
    deadline: "2026-11-20",
    submission_link: "https://drive.google.com",
    status: "Selesai",
  },
  {
    id: "task-4",
    student_id: currentStudent.id,
    course_id: 1,
    course_name: "Pengembangan Aplikasi Web",
    task_title: "Dokumentasi Compiler, Transpiler, Bundler & .env",
    task_desc: "Tulis ringkasan teknis di halaman web pribadi untuk kelengkapan tugas.",
    assigned_date: "",
    created_at: todayStr,
    deadline: "2026-12-06",
    submission_link: "",
    status: "Belum Selesai",
  },
];

const courseCollection = new DataCollection<Course>(SEED_COURSES);
const taskCollection = new DataCollection<TaskRecord>(SEED_TASKS);

let isDrawerOpen = true;
let activeMenu: DrawerMenu = "dashboard";

// State halaman Dashboard
let activeCardFilter: QuickCardFilter = "ALL";
let searchKeyword = "";
let createdFilter: CreatedFilter = "ALL";
let deadlineFilter: DeadlineFilter = "ALL";
let sortField: SortField = "deadline";
let editingTaskId: string | null = null;

// State halaman Mata Kuliah & Profil
let coursePageState: CoursePageState = createInitialCoursePageState();
let profilePageState: ProfilePageState = createInitialProfilePageState();

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

function getDaysUntilDeadline(deadlineStr: string): number {
  if (!deadlineStr) return 9999;
  const today = new Date(`${getTodayDateString()}T00:00:00`);
  const target = new Date(`${deadlineStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysSinceCreated(createdStr: string): number {
  if (!createdStr) return 9999;
  const today = new Date(`${getTodayDateString()}T00:00:00`);
  const created = new Date(`${createdStr}T00:00:00`);
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
    uncompleted: tasks.filter((t) => t.status === "Belum Selesai").length,
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
    if (activeCardFilter === "PENDING" && task.status !== "Belum Selesai") return false;
    if (activeCardFilter === "H7_DEADLINE" && !isDueWithinH7(task)) return false;
    if (activeCardFilter === "COMPLETED" && task.status !== "Selesai") return false;

    if (q.length > 0) {
      const hay = `${task.task_title} ${task.course_name} ${task.task_desc}`.toLowerCase();
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
    if (sortField === "createdAt") return b.created_at.localeCompare(a.created_at);
    return a.deadline.localeCompare(b.deadline);
  });

  return sorted.map((task) => {
    const daysLeft = getDaysUntilDeadline(task.deadline);
    const isH7 = isDueWithinH7(task);

    if (task.status === "Selesai") {
      return { ...task, badgeLabel: "Selesai", badgeVariant: "completed" };
    }
    if (isH7) {
      return {
        ...task,
        badgeLabel: daysLeft === 0 ? "Deadline Hari Ini" : `H-${daysLeft} Deadline`,
        badgeVariant: "urgent",
      };
    }
    if (daysLeft < 0) {
      return {
        ...task,
        badgeLabel: `Terlambat (${Math.abs(daysLeft)}h)`,
        badgeVariant: "urgent",
      };
    }
    return { ...task, badgeLabel: task.status, badgeVariant: "pending" };
  });
}

// ==========================================
// CRUD TUGAS & MATA KULIAH DI MEMORY
// ==========================================

function openTaskModal(taskId?: string): void {
  editingTaskId = taskId ?? null;
  const existing = taskId ? taskCollection.findById(taskId) : undefined;
  const today = getTodayDateString();

  if (existing) {
    showTaskModal({
      heading: "Edit Tugas Kuliah",
      showStatusField: true,
      values: {
        task_title: existing.task_title,
        course_name: existing.course_name,
        task_desc: existing.task_desc,
        assigned_date: existing.assigned_date,
        deadline: existing.deadline,
        submission_link: existing.submission_link,
        status: existing.status,
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

function resolveCourseRecord(courseName: string): Course {
  const matched = courseCollection
    .getAll()
    .find((c) => c.course_name.toLowerCase() === courseName.toLowerCase());
  if (matched) return matched;

  const nextId =
    courseCollection.getAll().reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const newCourse: Course = {
    id: nextId,
    course_name: courseName,
    course_code: null,
    lecturer_name: null,
    semester: "2026 Ganjil",
  };
  courseCollection.setAll([...courseCollection.getAll(), newCourse]);
  return newCourse;
}

function saveTask(values: TaskFormValues): void {
  const course = resolveCourseRecord(values.course_name);
  const currentList = taskCollection.getAll();
  const autoCreatedAt = getTodayDateString();

  if (editingTaskId) {
    taskCollection.setAll(
      currentList.map((item) =>
        item.id === editingTaskId
          ? {
              ...item,
              course_id: course.id,
              course_name: course.course_name,
              task_title: values.task_title,
              task_desc: values.task_desc,
              assigned_date: values.assigned_date,
              deadline: values.deadline,
              submission_link: values.submission_link,
              status: values.status,
            }
          : item
      )
    );
  } else {
    const newTask: TaskRecord = {
      id: `task-${Date.now()}`,
      student_id: currentStudent.id,
      course_id: course.id,
      course_name: course.course_name,
      task_title: values.task_title,
      task_desc: values.task_desc,
      assigned_date: values.assigned_date,
      created_at: autoCreatedAt,
      deadline: values.deadline,
      submission_link: values.submission_link,
      status: "Belum Selesai",
    };
    taskCollection.setAll([newTask, ...currentList]);
  }

  editingTaskId = null;
  hideTaskModal();
  renderView();
}

function toggleTaskStatus(taskId: string): void {
  taskCollection.setAll(
    taskCollection.getAll().map((item) =>
      item.id === taskId
        ? { ...item, status: item.status === "Selesai" ? "Belum Selesai" : "Selesai" }
        : item
    )
  );
  renderView();
}

function deleteTask(taskId: string): void {
  taskCollection.setAll(taskCollection.getAll().filter((item) => item.id !== taskId));
  renderView();
}

function saveCourse(values: CourseFormValues, editingCourseId: number | null): void {
  const currentCourses = courseCollection.getAll();
  const normalizedCode = values.course_code || null;
  const normalizedLecturer = values.lecturer_name || null;

  if (editingCourseId !== null) {
    courseCollection.setAll(
      currentCourses.map((item) =>
        item.id === editingCourseId
          ? {
              ...item,
              course_name: values.course_name,
              course_code: normalizedCode,
              lecturer_name: normalizedLecturer,
              semester: values.semester,
            }
          : item
      )
    );

    taskCollection.setAll(
      taskCollection.getAll().map((task) =>
        task.course_id === editingCourseId
          ? { ...task, course_name: values.course_name }
          : task
      )
    );
  } else {
    const nextId =
      currentCourses.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const newCourse: Course = {
      id: nextId,
      course_name: values.course_name,
      course_code: normalizedCode,
      lecturer_name: normalizedLecturer,
      semester: values.semester,
    };
    courseCollection.setAll([...currentCourses, newCourse]);
  }

  renderView();
}

function deleteCourse(courseId: number): void {
  courseCollection.setAll(
    courseCollection.getAll().filter((item) => item.id !== courseId)
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
  `;
}

function renderView(): void {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;

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
  `;

  attachListeners();
}

function attachListeners(): void {
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
      onToggleTask: toggleTaskStatus,
      onEditTask: (id) => openTaskModal(id),
      onDeleteTask: deleteTask,
    });

    bindTaskModalEvents({
      onClose: () => {
        editingTaskId = null;
        hideTaskModal();
      },
      onSubmit: saveTask,
    });
  } else if (activeMenu === "courses") {
    bindCoursePageEvents(courseCollection.getAll(), coursePageState, {
      onChangeState: (updater) => {
        coursePageState = updater(coursePageState);
        renderView();
      },
      onAddCourse: saveCourse,
      onDeleteCourse: deleteCourse,
    });
  } else {
    bindProfilePageEvents({
      onChangeState: (updater) => {
        profilePageState = updater(profilePageState);
        renderView();
      },
      onSaveProfile: (updated) => {
        currentStudent = {
          ...currentStudent,
          ...updated,
        };
        renderView();
      },
      onVerifyOldPassword: (oldPassword) => oldPassword === currentPassword,
      onConfirmChangePassword: ({ newPassword }) => {
        currentPassword = newPassword;
      },
    });
  }
}

// ==========================================
// STARTUP
// ==========================================

renderView();