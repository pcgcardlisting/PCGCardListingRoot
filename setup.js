#!/usr/bin/env node
/**
 * setup.js — run this once on a new machine after cloning
 * Usage: node setup.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n🚀 PCG Card Listing — Setup\n");

// 1. Install dependencies
console.log("📦 Installing dependencies...");
execSync("npm install", { stdio: "inherit" });

// 2. Create .env if it doesn't exist
const envPath = path.join(__dirname, ".env");
const envExample = path.join(__dirname, ".env.example");
if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExample, envPath);
  console.log("\n✅ Created .env from .env.example");
  console.log("⚠️  Open .env and fill in your API keys before starting the app.\n");
} else {
  console.log("✅ .env already exists — skipping.");
}

// 3. Push DB schema
console.log("\n🗄️  Setting up database...");
execSync("npx prisma db push", { stdio: "inherit" });
execSync("npx prisma generate", { stdio: "inherit" });

console.log("\n✅ Setup complete!");
console.log("\nTo start the app, run:\n");
console.log("   npm run dev\n");
console.log("Then open: http://localhost:3000\n");
