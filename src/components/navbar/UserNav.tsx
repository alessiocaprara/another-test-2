"use client"

import profilePicPlaceholder from "@/assets/profile-pic-placeholder.png"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "@prisma/client"
import { signIn, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Avatar } from "../ui/avatar"
import { usePathname } from "next/navigation"

interface UserNavProps {
  user: User | undefined
}

export function UserNav({ user }: UserNavProps) {

  const pathname = usePathname();

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8" >
            {user
              ? <Image
                src={user.image || profilePicPlaceholder}
                style={{ objectFit: "contain" }}
                width={32}
                height={32}
                alt={"Profile picture"} />
              : <span className="m-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </span>
            }
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {user
        ? <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username || user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/settings">
              <DropdownMenuItem>
                Settings
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Log out
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
        : <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem onClick={() => signIn("", { callbackUrl: pathname })}>
            Log in
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      }

    </DropdownMenu>
  )
}
