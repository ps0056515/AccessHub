const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, files);
    } else if (p.endsWith(".jsx") || p.endsWith(".js")) {
      files.push(p);
    }
  }
  return files;
}

const files = walk(path.join(__dirname, "src"));

const VAGUE_LABELS = /^(submit|go|ok|yes|no|field|input|value|option|item|button|more|read more)$/i;
const VAGUE_HEADINGS = /^(information|details|content|general|miscellaneous|section|data|more|untitled|heading|settings)$/i;

console.log("--- SUSPICIOUS HEADINGS ---");
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const headingRegex = /<(h[1-6]|role="heading")[^>]*>([^<]+)<\/\1>/gi;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (VAGUE_HEADINGS.test(text)) {
      console.log(`[${path.basename(file)}] ${match[1]}: "${text}"`);
    }
  }
});

console.log("\n--- SUSPICIOUS LABELS ---");
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  
  // Check <label> elements
  const labelRegex = /<label[^>]*>([^<]+)<\/label>/gi;
  let match;
  while ((match = labelRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (VAGUE_LABELS.test(text)) {
      console.log(`[${path.basename(file)}] label: "${text}"`);
    }
  }

  // Check buttons
  const btnRegex = /<button[^>]*>([^<]+)<\/button>/gi;
  while ((match = btnRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (VAGUE_LABELS.test(text)) {
      console.log(`[${path.basename(file)}] button: "${text}"`);
    }
  }

  // Check aria-label
  const ariaRegex = /aria-label="([^"]+)"/gi;
  while ((match = ariaRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (VAGUE_LABELS.test(text) || VAGUE_HEADINGS.test(text)) {
      console.log(`[${path.basename(file)}] aria-label: "${text}"`);
    }
  }
});

