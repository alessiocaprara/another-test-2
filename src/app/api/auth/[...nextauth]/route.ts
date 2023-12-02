import { mergeAnonymousCartInUserCart } from "@/lib/db/cart";
import { prisma } from "@/lib/db/prisma-client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, User } from "@prisma/client";
import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as PrismaClient) as Adapter,
    providers: [
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            maxAge: 60 * 60, // How long email links are valid for (seconds, default 24h)
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            session.user.username = (user as User).username;
            return session;
        }
    },
    events: {
        async signIn({ user }) {
            await mergeAnonymousCartInUserCart(user.id);
        },
    },
    pages: {
        signIn: "/login"
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

