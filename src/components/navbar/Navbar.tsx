import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import goatLogo from "@/assets/goat-logo.png";
import { getCart } from "@/lib/db/cart";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icons } from "../icons";
import { CartNav } from "./CartNav";
import { MainNav } from "./MainNav";
import { UserNav } from "./UserNav";

async function searchProducts(formData: FormData) {
    "use server";
    const searchQuery = formData.get("searchQuery")?.toString();
    if (searchQuery) {
        redirect("/search?query=" + searchQuery)
    }
}

export default async function Navbar() {

    const session = await getServerSession(authOptions);
    const cart = await getCart();

    return (
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between border-b">

                <div className="sm:hidden">
                    <Icons.gitHub className="h-8 w-auto" />
                </div>

                <div className="self-stretch flex items-center gap-3 w-full">

                    <Link href="/">
                        <Image
                            className="hidden sm:block h-8 w-auto"
                            width={32}
                            height={32}
                            src={goatLogo}
                            alt="Your Company"
                        />
                    </Link>

                    <MainNav />

                    <div className="ml-auto flex items-center">
                        <CartNav cart={cart} />
                    </div>
                    <div className="flex items-center">
                        <UserNav user={session?.user as User} />
                    </div>
                </div>
            </div>
        </div>
    )

}