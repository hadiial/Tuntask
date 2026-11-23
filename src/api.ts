import type { Student, Course, TaskRecord, TaskStatus } from "./main";
import type { CourseFormValues } from "./components/CourseModal";
import type { TaskFormValues } from "./components/TaskModal";
import type { ProfileEditableFields } from "./components/ProfileForm";
import type { ChangePasswordPayload } from "./profile";
import type { LoginCredentials } from "./login";
import type { RegisterPayload } from "./register";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiResult<T> {
  ok: boolean;
  message?: string;
  data?: T;
}

function normalizeTask(raw: TaskRecord): TaskRecord {
  return {
    ...raw,
    id: String(raw.id),
    student_id: Number(raw.student_id),
    course_id: Number(raw.course_id),
  };
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...init,
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) {
      return {
        ok: false,
        message: body.message || `Request gagal (HTTP ${res.status}).`,
      };
    }

    return { ok: true, data: body as T };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Tidak dapat terhubung ke server API: ${err.message}`
          : "Tidak dapat terhubung ke server API.",
    };
  }
}

export async function loginStudent(
  credentials: LoginCredentials
): Promise<ApiResult<Student>> {
  const res = await requestJson<{ student: Student }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return { ok: res.ok, message: res.message, data: res.data?.student };
}

export async function registerStudent(
  payload: RegisterPayload
): Promise<ApiResult<Student>> {
  const res = await requestJson<{ student: Student }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, message: res.message, data: res.data?.student };
}

export async function updateStudentProfile(
  studentId: number,
  payload: ProfileEditableFields
): Promise<ApiResult<Student>> {
  const res = await requestJson<{ student: Student }>(
    `/api/auth/profile/${studentId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return { ok: res.ok, message: res.message, data: res.data?.student };
}

export async function verifyStudentPassword(
  studentId: number,
  oldPassword: string
): Promise<boolean> {
  const res = await requestJson<null>(
    `/api/auth/profile/${studentId}/verify-password`,
    {
      method: "POST",
      body: JSON.stringify({ oldPassword }),
    }
  );
  return res.ok;
}

export async function changeStudentPassword(
  studentId: number,
  payload: ChangePasswordPayload
): Promise<ApiResult<null>> {
  return requestJson<null>(`/api/auth/profile/${studentId}/password`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchCourses(studentId: number): Promise<ApiResult<Course[]>> {
  const res = await requestJson<{ courses: Course[] }>(
    `/api/courses?studentId=${encodeURIComponent(String(studentId))}`
  );
  return { ok: res.ok, message: res.message, data: res.data?.courses ?? [] };
}

export async function createCourse(
  studentId: number,
  values: CourseFormValues
): Promise<ApiResult<Course>> {
  const res = await requestJson<{ course: Course }>("/api/courses", {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, ...values }),
  });
  return { ok: res.ok, message: res.message, data: res.data?.course };
}

export async function updateCourse(
  studentId: number,
  id: number,
  values: CourseFormValues
): Promise<ApiResult<Course>> {
  const res = await requestJson<{ course: Course }>(`/api/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify({ student_id: studentId, ...values }),
  });
  return { ok: res.ok, message: res.message, data: res.data?.course };
}

export async function removeCourse(
  studentId: number,
  id: number
): Promise<ApiResult<null>> {
  return requestJson<null>(
    `/api/courses/${id}?studentId=${encodeURIComponent(String(studentId))}`,
    {
      method: "DELETE",
    }
  );
}

export async function fetchTasks(studentId: number): Promise<ApiResult<TaskRecord[]>> {
  const res = await requestJson<{ tasks: TaskRecord[] }>(
    `/api/tasks?studentId=${encodeURIComponent(String(studentId))}`
  );
  return {
    ok: res.ok,
    message: res.message,
    data: (res.data?.tasks ?? []).map(normalizeTask),
  };
}

export async function createTask(payload: {
  student_id: number;
  course_id: number;
  values: TaskFormValues;
}): Promise<ApiResult<TaskRecord>> {
  const res = await requestJson<{ task: TaskRecord }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      student_id: payload.student_id,
      course_id: payload.course_id,
      task_title: payload.values.task_title,
      task_desc: payload.values.task_desc,
      assigned_date: payload.values.assigned_date || null,
      deadline: payload.values.deadline,
      submission_link: payload.values.submission_link || null,
      status: "Belum Selesai",
    }),
  });
  return {
    ok: res.ok,
    message: res.message,
    data: res.data?.task ? normalizeTask(res.data.task) : undefined,
  };
}

export async function updateTask(
  id: string | number,
  payload: {
    course_id: number;
    values: TaskFormValues;
  }
): Promise<ApiResult<TaskRecord>> {
  const res = await requestJson<{ task: TaskRecord }>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      course_id: payload.course_id,
      task_title: payload.values.task_title,
      task_desc: payload.values.task_desc,
      assigned_date: payload.values.assigned_date || null,
      deadline: payload.values.deadline,
      submission_link: payload.values.submission_link || null,
      status: payload.values.status,
    }),
  });
  return {
    ok: res.ok,
    message: res.message,
    data: res.data?.task ? normalizeTask(res.data.task) : undefined,
  };
}

export async function updateTaskStatus(
  id: string | number,
  status: TaskStatus
): Promise<ApiResult<null>> {
  return requestJson<null>(`/api/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function removeTask(id: string | number): Promise<ApiResult<null>> {
  return requestJson<null>(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}