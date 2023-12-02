import Link from "next/link"
import { UserAuthForm } from "./user-auth-form"

export default function LoginPage() {
    return (
        <>
            <div className="absolute top-0 start-0 w-screen h-screen bg-background flex flex-col items-center justify-center">
                <div className="flex flex-col space-y-6 max-w-sm">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to sign in
                        </p>
                    </div>
                    <UserAuthForm buttonLabel="Sign in with email" />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </>
    )
}