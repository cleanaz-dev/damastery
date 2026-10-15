import { getAllClients } from "@/lib/actions/get-clients"
import { prisma } from "@/lib/prisma"




export default async function ClientsPage() {

    const clients = await getAllClients()

    return (
        <div className="">
            <h1 className="text-3xl font-bold">Welcome to the Clients Page</h1>
        </div>
    )
}