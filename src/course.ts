import { renderPageHeader, bindPageHeaderEvents } from "./components/PageHeader";
import { renderCourseTable, bindCourseTableEvents, type CourseRowItem, } from "./components/CourseTable";
import { renderCourseModal, showCourseModal, hideCourseModal, bindCourseModalEvents, type CourseFormValues, } from "./components/CourseModal";
import { renderAlertPopup, showAlertPopup, bindAlertPopupEvents } from "./components/AlertPopup";
import type { Course, TaskRecord } from "./main";

const DELETE_COURSE_CONFIRM_ID = "deleteCourseConfirmPopup";

export interface CoursePageState {
  searchKeyword: string;
  editingCourseId: number | null;
}

export interface CoursePageActions {
  onChangeState: (updater: (prev: CoursePageState) => CoursePageState) => void;
  onAddCourse: (values: CourseFormValues, editingId: number | null) => void;
  onDeleteCourse: (courseId: number) => void;
}

export function createInitialCoursePageState(): CoursePageState {
  return {
    searchKeyword: "",
    editingCourseId: null,
  };
}

function getFilteredCourseRows(
  courses: Course[],
  tasks: TaskRecord[],
  state: CoursePageState
): CourseRowItem[] {
  const q = state.searchKeyword.trim().toLowerCase();

  return courses
    .map((course) => ({
      ...course,
      taskCount: tasks.filter((t) => t.course_id === course.id).length,
    }))
    .filter((course) => {
      if (q.length === 0) return true;
      const hay = `${course.course_name} ${course.course_code ?? ""} ${
        course.lecturer_name ?? ""
      } ${course.semester}`.toLowerCase();
      return hay.includes(q);
    });
}

export function renderCoursePage(
  courses: Course[],
  tasks: TaskRecord[],
  state: CoursePageState
): string {
  const rows = getFilteredCourseRows(courses, tasks, state);

  return `
    ${renderPageHeader({
      title: "Mata Kuliah",
      subtitle: "Kelola data mata kuliah sesuai skema tabel courses",
      actionLabel: "+ Tambah Mata Kuliah",
    })}

    ${renderCourseTable({
      rows,
      searchKeyword: state.searchKeyword,
    })}

    ${renderCourseModal()}
    ${renderAlertPopup({
      id: DELETE_COURSE_CONFIRM_ID,
      title: "Konfirmasi Hapus Mata Kuliah",
      message: "Apakah kamu yakin ingin menghapus mata kuliah ini?",
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
    })}
  `;
}

export function bindCoursePageEvents(
  courses: Course[],
  state: CoursePageState,
  actions: CoursePageActions
): void {
  let pendingDeleteCourseId: number | null = null;

  bindPageHeaderEvents(() => {
    actions.onChangeState((prev) => ({ ...prev, editingCourseId: null }));
    showCourseModal({
      heading: "Tambah Mata Kuliah",
      values: {
        course_name: "",
        course_code: "",
        lecturer_name: "",
        semester: "",
      },
    });
  });

  bindCourseTableEvents({
    onSearchChange: (keyword) => {
      actions.onChangeState((prev) => ({ ...prev, searchKeyword: keyword }));
    },
    onEditCourse: (id) => {
      const target = courses.find((c) => c.id === id);
      if (!target) return;
      actions.onChangeState((prev) => ({ ...prev, editingCourseId: id }));
      showCourseModal({
        heading: "Edit Mata Kuliah",
        values: {
          course_name: target.course_name,
          course_code: target.course_code ?? "",
          lecturer_name: target.lecturer_name ?? "",
          semester: target.semester,
        },
      });
    },
    onDeleteCourse: (id) => {
      const target = courses.find((c) => c.id === id);
      pendingDeleteCourseId = id;
      showAlertPopup(
        DELETE_COURSE_CONFIRM_ID,
        target
          ? `Apakah kamu yakin ingin menghapus mata kuliah "${target.course_name}"?`
          : "Apakah kamu yakin ingin menghapus mata kuliah ini?"
      );
    },
  });

  bindAlertPopupEvents(DELETE_COURSE_CONFIRM_ID, {
    onConfirm: () => {
      if (pendingDeleteCourseId === null) return;
      const targetId = pendingDeleteCourseId;
      pendingDeleteCourseId = null;
      actions.onDeleteCourse(targetId);
    },
    onCancel: () => {
      pendingDeleteCourseId = null;
    },
  });

  bindCourseModalEvents({
    onClose: () => {
      actions.onChangeState((prev) => ({ ...prev, editingCourseId: null }));
      hideCourseModal();
    },
    onSubmit: (values) => {
      actions.onAddCourse(values, state.editingCourseId);
      actions.onChangeState((prev) => ({ ...prev, editingCourseId: null }));
      hideCourseModal();
    },
  });
}