"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Overview', href: '/overview' },
  { name: 'Dashboard', href: '/dashboard' },
]

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {

  const pathname = usePathname()

  return (
    <div className="self-stretch hidden sm:flex sm:gap-4 sm: items-center">
      {navigation.map((item) => (
        <Link
          href={item.href}
          key={item.name}
          className={cn(
            pathname === item.href
              ? "text-sm font-medium transition-colors hover:text-primary"
              : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}
