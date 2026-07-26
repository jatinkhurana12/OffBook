const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paid = searchParams.get("paid"); // "true" | "false" | null (= all)
  const skill = (searchParams.get("skill") || "").trim().toLowerCase();
  const minPayment = searchParams.get("minPayment");

  let sql = `
    SELECT internships.*, users.name AS poster_name
    FROM internships JOIN users ON users.id = internships.user_id
    WHERE 1=1
  `;
  const args = [];

  if (paid === "true" || paid === "false") {
    args.push(paid === "true");
    sql += ` AND internships.paid = $${args.length}`;
  }
  if (skill) {
    args.push(`%${skill}%`);
    sql += ` AND LOWER(internships.skills) LIKE $${args.length}`;
  }
  if (minPayment) {
    args.push(Number(minPayment));
    sql += ` AND internships.payment_amount >= $${args.length}`;
  }

  sql += " ORDER BY internships.created_at DESC";

  const result = await query(sql, args);
  return NextResponse.json({ internships: result.rows });
}

export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const {
    role_title,
    organization,
    description,
    skills,
    paid,
    payment_amount,
    payment_period,
    location,
    apply_instructions,
  } = await request.json();

  if (!role_title || !organization || !description) {
    return NextResponse.json(
      { error: "Role title, organization, and description are required." },
      { status: 400 }
    );
  }
  if (paid && (!payment_amount || Number(payment_amount) <= 0)) {
    return NextResponse.json(
      { error: "Add a payment amount, or mark this opening as unpaid." },
      { status: 400 }
    );
  }
  if (!apply_instructions || !apply_instructions.trim()) {
    return NextResponse.json(
      { error: "Add how people should apply (an email or a link)." },
      { status: 400 }
    );
  }

  const result = await query(
    `INSERT INTO internships
       (user_id, role_title, organization, description, skills, paid, payment_amount, payment_period, location, apply_instructions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [
      session.id,
      role_title.trim(),
      organization.trim(),
      description.trim(),
      skills || "",
      !!paid,
      paid ? Number(payment_amount) : null,
      paid ? payment_period || "" : "",
      location || "remote",
      apply_instructions.trim(),
    ]
  );

  return NextResponse.json({ ok: true, id: result.rows[0].id });
}