import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { getValidAssignmentByToken } from "@/lib/forms/assignments";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) notFound();

  // Look up the assignment from Postgres instead of Redis
  const assignment = await getValidAssignmentByToken(token);
  if (!assignment) notFound(); // Expired, inactive, or invalid token

  return (
    <main>
      <RegisterForm
        token={token}
        defaults={{
          name: assignment.name ?? "",
          email: assignment.email,
        }}
      />
    </main>
  );
}