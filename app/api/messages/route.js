const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const result = await query(
    `WITH threads AS (
       SELECT
         CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END AS other_id,
         body, created_at, sender_id, attachment_type
       FROM messages
       WHERE (sender_id = $1 OR recipient_id = $1)
         AND NOT (
           (sender_id = $1 AND deleted_by_sender) OR (recipient_id = $1 AND deleted_by_recipient)
         )
     ),
     latest AS (
       SELECT DISTINCT ON (other_id) other_id, body AS last_body, created_at AS last_at,
              sender_id AS last_sender_id, attachment_type AS last_attachment_type
       FROM threads
       ORDER BY other_id, created_at DESC
     ),
     unread AS (
       SELECT sender_id AS other_id, COUNT(*) AS unread_count
       FROM messages
       WHERE recipient_id = $1 AND read_at IS NULL AND NOT deleted_by_recipient
       GROUP BY sender_id
     )
     SELECT users.id, users.name, profiles.avatar_url,
            latest.last_body, latest.last_at, latest.last_sender_id, latest.last_attachment_type,
            COALESCE(unread.unread_count, 0) AS unread_count
     FROM latest
     JOIN users ON users.id = latest.other_id
     JOIN profiles ON profiles.user_id = users.id
     LEFT JOIN unread ON unread.other_id = latest.other_id
     ORDER BY latest.last_at DESC`,
    [session.id]
  );

  return NextResponse.json({ conversations: result.rows });
}