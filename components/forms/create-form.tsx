"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import {
  createNewForm,
  type CreateFormState,
} from "@/lib/actions/create-new-form";

const initialState: CreateFormState = {};

export function CreateForm() {
  const [state, action, pending] = useActionState(
    createNewForm,
    initialState,
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <label
          htmlFor="form-title"
          className="text-sm font-medium text-foreground"
        >
          Form title
        </label>

        <input
          id="form-title"
          name="title"
          type="text"
          maxLength={100}
          placeholder="e.g. Client intake form"
          required
          disabled={pending}
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "form-title-error" : undefined}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {state.error ? (
          <p
            id="form-title-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}

        {pending ? "Creating..." : "Create form"}
      </button>
    </form>
  );
}