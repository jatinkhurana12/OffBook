const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
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

export async function PUT(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM internships WHERE id = $1", [params.id]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only edit your own postings." }, { status: 403 });
  }

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

  await query(
    `UPDATE internships SET
       role_title = $1, organization = $2, description = $3, skills = $4,
       paid = $5, payment_amount = $6, payment_period = $7, location = $8, apply_instructions = $9
     WHERE id = $10`,
    [
      role_title.trim(),
      organization.trim(),
      description.trim(),
      skills || "",
      !!paid,
      paid ? Number(payment_amount) : null,
      paid ? payment_period || "" : "",
      location || "remote",
      apply_instructions.trim(),
      params.id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM internships WHERE id = $1", [params.id]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only delete your own postings." }, { status: 403 });
  }

  await query("DELETE FROM internships WHERE id = $1", [params.id]);
  return NextResponse.json({ ok: true });
}