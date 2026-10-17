import Link from "next/link";
import { ClipboardList, FileText, Plus } from "lucide-react";

import type { FormWithSubmissions } from "@/lib/actions/get-forms";
import { CreateForm } from "@/components/forms/create-form";
import { FormRowActions } from "./form-buttons";

type FormPageProps = {
  forms: FormWithSubmissions[];
};

export default function FormPage({ forms }: FormPageProps) {
  const totalSubmissions = forms.reduce(
    (total, form) => total + form.submissions.length,
    0,
  );

  return (
    <main className="">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Administration</p>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="mt-1 text-muted-foreground">
            Create forms and review submitted client information.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total forms"
          value={forms.length}
          icon={<FileText className="size-5" />}
        />

        <StatCard
          label="Total submissions"
          value={totalSubmissions}
          icon={<ClipboardList className="size-5" />}
        />
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Existing forms</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a form to view its submissions.
            </p>
          </div>

          {forms.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <FileText className="size-6 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">No forms yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first form using the panel on this page.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {forms.map((form) => {
                const submissionCount = form.submissions.length;

                return (
                  <li
                    key={form.id}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                  >
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-medium group-hover:text-primary">
                          {form.title}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Created{" "}
                          {new Intl.DateTimeFormat("en", {
                            dateStyle: "medium",
                          }).format(new Date(form.createdAt))}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {submissionCount}{" "}
                        {submissionCount === 1 ? "submission" : "submissions"}
                      </span>
                    </Link>

                    <FormRowActions id={form.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="rounded-xl border bg-card p-5 lg:sticky lg:top-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Plus className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">Create a new form</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You can configure the form after creating it.
              </p>
            </div>
          </div>

          <CreateForm />
        </aside>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>

      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
