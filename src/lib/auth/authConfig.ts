import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { clearStaleTokens } from "./clearStaleTokensServerAction";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/auth-success",
    error: "/auth/auth-error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT!, 10),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);

        const transport = nodemailer.createTransport(provider.server);

        const message = {
          to: identifier,
          from: provider.from,
          subject: `Вход на ${host}`,
          text: `Вход на ${host}\n\n${url}\n\n`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
              <h1>Добро пожаловать</h1>
              <p>Пожалуйста, нажмите на ссылку ниже, чтобы войти:</p>
              <a href="${url}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background: #0070f3; color: #fff; text-decoration: none; border-radius: 5px;">
                Войти
              </a>
              <p>Если вы не запрашивали вход, вы можете проигнорировать это письмо.</p>
              <p style="font-size: 12px; color: #666;">Эта ссылка будет действительна в течение 10 минут.</p>
            </div>
          `,
        };

        await transport.sendMail(message);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        await clearStaleTokens();
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
});
