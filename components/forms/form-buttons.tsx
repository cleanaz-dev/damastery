"use client"

import { useState, useTransition } from "react"
import { Check, Copy, Trash2 } from "lucide-react"
import { deleteForm } from "@/lib/actions/delete-form" // adjust path

export function FormRowActions({ id }: { id: string }) {
    const [copied, setCopied] = useState(false)
    const [pending, startTransition] = useTransition()

    async function handleCopy(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        await navigator.clipboard.writeText(id)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("Delete this form and all of its submissions?")) return
        startTransition(async () => {
            await deleteForm(id)
        })
    }

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={handleCopy}
                title="Copy form ID"
                className="rounded p-1.5 text-muted-foreground hover:bg-black/5"
            >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                title="Delete form"
                className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
                <Trash2 className="size-4" />
            </button>
        </div>
    )
}