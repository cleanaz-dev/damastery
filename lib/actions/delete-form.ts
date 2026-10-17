"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "../prisma"

export async function deleteForm(id: string) {
    // TODO: check the caller is an admin here. Server actions are public endpoints.

    await prisma.$transaction([
        prisma.formSubmission.deleteMany({ where: { formId: id } }), // adjust model name
        prisma.form.delete({ where: { id } }),
    ])

    revalidatePath("/admin/forms") // adjust to your route
}