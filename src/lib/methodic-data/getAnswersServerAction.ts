"use server";

import { pool } from "@/lib/postgres";

export const getAnswers = async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM answers");
    return rows || null;
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }
};
