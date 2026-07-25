require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");
const { query, pool } = require("./db");

const users = [
  {
    name: "Maya Chen",
    email: "maya@example.com",
    headline: "Dropped out of CS junior year, self-taught backend since",
    left_because: "Tuition doubled and financial aid fell through",
    bio: "Building payment infra for freelancers. Previously shipped two side projects solo.",
    skills: "backend, node, postgres, system design",
    looking_for: "a design-minded co-founder",
    availability: "open-to-cofound",
    shipped: "2 side projects, 1 with 40 paying users",
  },
  {
    name: "Jordan Ruiz",
    email: "jordan@example.com",
    headline: "Left high school at 17, now doing freelance design",
    left_because: "School felt irrelevant to what I actually wanted to build",
    bio: "Product designer who cares about ugly-but-useful tools for people without a safety net.",
    skills: "product design, figma, brand, front-end",
    looking_for: "a backend engineer to build with",
    availability: "already-building",
    shipped: "3 client projects, 1 own product with early users",
  },
  {
    name: "Priya Nair",
    email: "priya@example.com",
    headline: "Ex-nursing student, now exploring healthtech",
    left_because: "Couldn't afford the last two years without crushing debt",
    bio: "Deep firsthand knowledge of hospital admin pain points. Non-technical, hungry to learn.",
    skills: "sales, healthcare domain knowledge, ops",
    looking_for: "a technical collaborator on healthcare admin tools",
    availability: "exploring",
    shipped: "Validated 3 problems via 20+ interviews",
  },
];

const problems = [
  {
    email: "maya@example.com",
    title: "Freelancers lose 6-8% to cross-border payment fees",
    domain: "fintech",
    severity: "painful",
    description:
      "I freelanced for two years and every international client payment ate 6-8% between wire fees and conversion spread. Existing tools like PayPal and Wise still aren't great for one-off invoices under $500 — the fixed fees dominate.",
    seeking: "Someone who's dealt with payment rails or has fintech compliance experience",
  },
  {
    email: "priya@example.com",
    title: "Hospital shift scheduling is still done on whiteboards and group texts",
    domain: "healthcare",
    severity: "deal-breaking",
    description:
      "Worked adjacent to nursing scheduling for a year. Most mid-size clinics still coordinate shift swaps over text threads. Someone always finds out they're double-booked at 6am. There's real willingness to pay for something simple that just works.",
    seeking: "A technical co-founder who wants to work on unglamorous but necessary healthcare ops tools",
  },
  {
    email: "jordan@example.com",
    title: "No good way to get design feedback from actual target users, fast",
    domain: "b2b",
    severity: "annoying",
    description:
      "As a freelance designer, getting feedback from 5 real users of a niche product usually takes a week of DMs and calendar wrangling. Existing user-testing platforms are built for enterprise, not solo builders.",
    seeking: "",
  },
];

async function main() {
  const emailToId = {};

  for (const u of users) {
    const existing = await query("SELECT id FROM users WHERE email = $1", [u.email]);
    if (existing.rows.length > 0) {
      emailToId[u.email] = existing.rows[0].id;
      continue;
    }
    const hash = bcrypt.hashSync("password123", 10);
    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [u.name, u.email, hash]
    );
    const userId = result.rows[0].id;
    emailToId[u.email] = userId;
    await query(
      `INSERT INTO profiles (user_id, headline, bio, left_because, skills, looking_for, availability, shipped)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, u.headline, u.bio, u.left_because, u.skills, u.looking_for, u.availability, u.shipped]
    );
  }

  for (const p of problems) {
    await query(
      `INSERT INTO problems (user_id, title, domain, severity, description, seeking)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [emailToId[p.email], p.title, p.domain, p.severity, p.description, p.seeking]
    );
  }

  console.log(`Seeded ${users.length} users and ${problems.length} problems.`);
  console.log("All seeded accounts use password: password123");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
