"use server";

import { signIn } from "@/lib/auth/authConfig";

export const handleEmailSignIn = async (email: string) => {
  try {
    await signIn("nodemailer", { email, callbackUrl: "/quiz" });
  } catch (error) {
    throw error;
  }
};