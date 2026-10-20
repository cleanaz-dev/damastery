// lib/forms/required-forms.ts
// Safe to import from client AND server components (no prisma here).

export const REQUIRED_FORMS = [
  { key: "baseline-audit", label: "Baseline Audit" },
  { key: "intake-form", label: "Intake Form" },
  { key: "coaching-agreement", label: "Coaching Agreement" },
] as const;

/**
 * Given the form keys a client has completed, returns the required forms
 * they still need to finish (empty array = they can book).
 */
// Ignores case and hyphens/underscores so "base-line-audit" and
// "baseline-audit" are treated as the same form.
const normalize = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

export function getMissingRequiredForms(completedKeys: string[]) {
  const done = new Set(completedKeys.map(normalize));
  return REQUIRED_FORMS.filter((f) => !done.has(normalize(f.key)));
}