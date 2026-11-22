export interface AuthFieldConfig {
  id: string;
  label: string;
  type: "text" | "password";
  placeholder: string;
  required?: boolean;
  minLength?: number;
  fullWidth?: boolean;
}

export interface AuthFormCardProps {
  appName: string;
  title: string;
  subtitle: string;
  formId: string;
  fields: AuthFieldConfig[];
  submitLabel: string;
  footerPrompt: string;
  footerLinkId: string;
  footerLinkLabel: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\x22/g, "&quot;");
}

export function renderAuthFormCard(props: AuthFormCardProps): string {
  const {
    appName,
    title,
    subtitle,
    formId,
    fields,
    submitLabel,
    footerPrompt,
    footerLinkId,
    footerLinkLabel,
  } = props;

  const fieldsHtml = fields
    .map((field) => {
      const reqAttr = field.required === false ? "" : "required";
      const minAttr = field.minLength ? `minlength="${field.minLength}"` : "";
      const spanClass = field.fullWidth ? "sm:col-span-2" : "";

      return `
        <div class="${spanClass}">
          <label for="${escapeHtml(field.id)}" class="mb-1 block text-xs font-semibold text-slate-700">
            ${escapeHtml(field.label)}
          </label>
          <input
            type="${field.type}"
            id="${escapeHtml(field.id)}"
            ${reqAttr}
            ${minAttr}
            placeholder="${escapeHtml(field.placeholder)}"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
          />
        </div>
      `;
    })
    .join("");

  return `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-800">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div class="mb-5 flex items-center gap-2.5">
          <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-600 text-sm font-bold text-white">
            T
          </div>
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
              ${escapeHtml(appName)}
            </div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">
              ${escapeHtml(title)}
            </h1>
          </div>
        </div>

        <p class="mb-5 text-xs leading-relaxed text-slate-500">
          ${escapeHtml(subtitle)}
        </p>

        <form id="${escapeHtml(formId)}" class="space-y-3.5">
          <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            ${fieldsHtml}
          </div>

          <button
            type="submit"
            class="mt-2 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
          >
            ${escapeHtml(submitLabel)}
          </button>
        </form>

        <div class="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          ${escapeHtml(footerPrompt)}
          <button
            type="button"
            id="${escapeHtml(footerLinkId)}"
            class="ml-1 font-semibold text-red-600 hover:underline cursor-pointer"
          >
            ${escapeHtml(footerLinkLabel)}
          </button>
        </div>
      </div>
    </div>
  `;
}