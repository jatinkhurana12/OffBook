#!/usr/bin/env node
// One-time local script to get YOUTUBE_REFRESH_TOKEN. Run this yourself,
// once, from your own machine — never on Vercel. Requires an OAuth
// client already created in Google Cloud Console (see setup notes).
//
// Usage:
//   YOUTUBE_CLIENT_ID=xxx YOUTUBE_CLIENT_SECRET=yyy node scripts/get-youtube-refresh-token.js
//
// It prints a Google consent URL, starts a tiny local server to catch the
// redirect, exchanges the code for tokens, and prints the refresh token —
// copy that into YOUTUBE_REFRESH_TOKEN in .env.local and in Vercel's
// Environment Variables.

const http = require("http");
const { URL } = require("url");

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const PORT = 8080;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET first (from Google Cloud Console).");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube",
    access_type: "offline",
    prompt: "consent",
  });

console.log("\n1. Log into the Google account that owns OffBook's YouTube channel.");
console.log("2. Open this URL in a browser and approve access:\n");
console.log(authUrl + "\n");
console.log(`Waiting for the redirect on ${REDIRECT_URI} ...\n`);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/oauth2callback") {
    res.end("Not found.");
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No code received. Close this tab and try again.");
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const data = await tokenRes.json();

    if (!data.refresh_token) {
      res.end("No refresh_token in the response — check your terminal.");
      console.error("Response from Google:", data);
      console.error(
        "\nIf refresh_token is missing, you've likely authorized this app before. Go to " +
          "https://myaccount.google.com/permissions, remove OffBook's access, and run this script again."
      );
      server.close();
      return;
    }

    res.end("Done — check your terminal, then close this tab.");
    console.log("\nYOUTUBE_REFRESH_TOKEN=" + data.refresh_token);
    console.log("\nAdd that to .env.local and to Vercel's Environment Variables.\n");
  } catch (err) {
    res.end("Something went wrong — see terminal.");
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(PORT);