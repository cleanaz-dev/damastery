import FormPage from "@/components/forms/form-page";
import { getAllForms } from "@/lib/actions/get-forms";
import { requireAdmin } from "@/lib/auth-guard";

export default async function Page() {
  await requireAdmin();

  const forms = await getAllForms();

  return (
    <div className="max-w-[1440px] mx-auto w-full p-6 lg:p-10">
      <FormPage forms={forms} />
    </div>
  );
}
