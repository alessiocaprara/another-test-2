"use server"

import { prisma } from "@/lib/db/prisma-client";
import delay from "delay";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";

export async function updateUser(userId: string, data: FormData) {

    await delay(1500);

    const username = data.get("username") as string | null;
    const dob = data.get("dob") as string | null;
    const gender = data.get("gender") as string | null;
    const profilePic = data.get("file") as unknown as File | null;

    console.log("userId: " + userId);
    console.log("username: " + username);
    console.log("dob: " + dob);
    console.log("gender: " + gender);
    console.log("profilePic: " + profilePic);

    if ((username === null) && (dob === null) && (gender && null) && (profilePic === null)) return;

    let profilePicDestinationPath: string | undefined = undefined;
    if (profilePic) {
        const bytes = await profilePic.arrayBuffer();
        const buffer = Buffer.from(bytes);
        profilePicDestinationPath = "/uploads/profile-pictures/" + userId + ".png";
        await sharp(buffer)
            .resize(500, 500, { withoutEnlargement: true })
            .toFile("./public" + profilePicDestinationPath);
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            username: (username === null) ? undefined : username,
            dob: (dob === null) ? undefined : dob,
            gender: (gender === null) ? undefined : gender,
            image: (profilePic === null)
                ? undefined
                : process.env.SERVER_URL! + profilePicDestinationPath! + "?lastupdated=" + Date.now(),
        }
    })

    revalidatePath("/settings");
    //redirect("/settings");

}

export async function updateRemoveUser(userId: string, field: string) {
    await delay(1500);
    console.log("updating " + field + " with null");
    await prisma.user.update({
        where: { id: userId },
        data: {
            username: (field === "username") ? null : undefined,
            dob: (field === "dob") ? null : undefined,
            gender: (field === "gender") ? null : undefined,
        }
    })
    revalidatePath("/settings");
    // redirect("/settings");
}