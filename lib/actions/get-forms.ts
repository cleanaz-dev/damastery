import { prisma } from "../prisma";

export async function getAllForms() {
    const forms = await prisma.form.findMany({
        include: {
            submissions: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return forms
}

export type FormWithSubmissions = Awaited<ReturnType<typeof getAllForms>>[number]
export type AllForms = Awaited<ReturnType<typeof getAllForms>>