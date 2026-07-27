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

console.log("--- HEADINGS ---");
let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const headingRegex = /<(h[1-6]|role="heading")[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    let text = match[2].trim().replace(/\s+/g, " ");
    if (text.length > 0 && text.length < 50) {
      console.log(`[${path.basename(file)}] ${match[1]}: ${text}`);
      count++;
    }
  }
});

console.log("\n--- BUTTONS ---");
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const btnRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  let match;
  while ((match = btnRegex.exec(content)) !== null) {
    let text = match[1].trim().replace(/\s+/g, " ");
    if (text.length > 0 && text.length < 50) {
      console.log(`[${path.basename(file)}] button: ${text}`);
    }
  }
});

console.log("\n--- LABELS ---");
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const labelRegex = /<label[^>]*>([\s\S]*?)<\/label>/gi;
  let match;
  while ((match = labelRegex.exec(content)) !== null) {
    let text = match[1].trim().replace(/\s+/g, " ");
    if (text.length > 0 && text.length < 50) {
      console.log(`[${path.basename(file)}] label: ${text}`);
    }
  }
});

