"use server";

import { pool } from "@/lib/postgres";

export const getProfessions = async (
  r: number,
  i: number,
  a: number,
  s: number,
  e: number,
  c: number
) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT job_id, soc_name, group_name, name, featured,
       ROUND((10000 - ((r - $1)^2 + (i - $2)^2 + (a - $3)^2 + (s - $4)^2 + (e - $5)^2 + (c - $6)^2)) / 100) * 100 AS score
      FROM jobs
      WHERE group_name IN ('Health Science', 'Education & Training')
      AND (r - $1)^2 + (i - $2)^2 + (a - $3)^2 + (s - $4)^2 + (e - $5)^2 + (c - $6)^2 < 10000
      ORDER BY featured DESC, score DESC LIMIT 10;
    `,
      [r, i, a, s, e, c]
    );

    return rows || null;
  } catch (error) {
    console.error("Error fetching professions:", error);
    throw error;
  }
};
