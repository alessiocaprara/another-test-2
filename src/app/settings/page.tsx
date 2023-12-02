import { prisma } from "@/lib/db/prisma-client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserProfileBasicInfo from "./_components/UserProfileBasicInfo";

export default async function SettingsProfilePage() {

    const session = await getServerSession(authOptions);
    if (!session) { redirect("/api/auth/signin?callbackUrl=/settings"); }

    // Questo potrebbe essere superfluo se già ho tutti i dati dell'utente nella sessione
    const authenticatedUser = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
    });
    if (!authenticatedUser) { redirect("/api/auth/signin?callbackUrl=/settings"); }

    return (
        <div className="space-y-6">
            <UserProfileBasicInfo user={authenticatedUser} />
        </div>
    )
}