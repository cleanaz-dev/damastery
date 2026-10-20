// lib/required-forms.ts
// Safe to import from client AND server components (no prisma here).

export const REQUIRED_FORMS = [
  { key: "base-line-audit", label: "Baseline Audit" },
  { key: "intake-form", label: "Intake Form" },
  { key: "coaching-agreement", label: "Coaching Agreement" },
] as const;

/**
 * Given the form keys a client has completed, returns the required forms
 * they still need to finish (empty array = they can book).
 */
export function getMissingRequiredForms(completedKeys: string[]) {
  const done = new Set(completedKeys);
  return REQUIRED_FORMS.filter((f) => !done.has(f.key));
}