const { query } = require("../../../lib/db");
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const result = await query(
    `SELECT internships.*, users.name AS poster_name, users.id AS poster_id
     FROM internships JOIN users ON users.id = internships.user_id
     WHERE internships.id = $1`,
    [params.id]
  );
  const internship = result.rows[0];
  if (!internship) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ internship });
}