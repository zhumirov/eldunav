"use server";

import { pool } from "@/lib/postgres";

export const getQuestions = async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM questions");
    return rows || null;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};
