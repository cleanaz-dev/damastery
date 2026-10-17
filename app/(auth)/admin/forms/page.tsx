import FormPage from "@/components/forms/form-page";
import { getAllForms } from "@/lib/actions/get-forms";
import { requireAdmin } from "@/lib/auth-guard";

export default async function Page() {
  await requireAdmin();

  const forms = await getAllForms();

  return <FormPage forms={forms} />;
}