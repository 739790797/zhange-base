import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(packageRoot, "tokens", "tarkov.json");
const tokens = JSON.parse(await readFile(sourcePath, "utf8"));

function kebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

const cssLines = ["/* Generated from tokens/tarkov.json. Do not edit directly. */", ".zhange-theme-tarkov {", "  color-scheme: dark;"];
for (const [group, values] of Object.entries(tokens)) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    if (typeof values === "string") cssLines.push(`  --zhange-${kebab(group)}: ${values};`);
    continue;
  }
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "number") continue;
    const prefix = group === "border" ? "border" : group;
    cssLines.push(`  --zhange-${prefix}-${kebab(name)}: ${value};`);
  }
}
cssLines.push(
  "",
  "  /* Compatibility aliases for legacy Tarkov app styles. */",
  "  --hb-bg: var(--zhange-color-bg);",
  "  --hb-panel: var(--zhange-color-panel);",
  "  --hb-panel-hover: var(--zhange-color-panel-hover);",
  "  --hb-border: var(--zhange-color-border);",
  "  --hb-orange: var(--zhange-color-accent);",
  "  --hb-orange-dim: var(--zhange-color-accent-dim);",
  "  --hb-green: var(--zhange-color-positive);",
  "  --hb-text: var(--zhange-color-text);",
  "  --hb-muted: var(--zhange-color-text-muted);",
  "  --hb-mono: var(--zhange-font-mono);",
  "  --hb-sans: var(--zhange-font-sans);",
  "  --hb-display: var(--zhange-font-display);",
  "}",
  "",
);

const jsOutput = `/* Generated from tokens/tarkov.json. Do not edit directly. */\nexport const TARKOV_TOKENS = ${JSON.stringify(tokens, null, 2)};\n`;

function declaration(value, depth = 0) {
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value).map(([key, child]) => {
      const childDeclaration = declaration(child, depth + 1);
      const separator = childDeclaration.startsWith("\n") ? "" : " ";
      return `${childIndent}readonly ${JSON.stringify(key)}:${separator}${childDeclaration};`;
    });
    return `\n{\n${entries.join("\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

const dtsOutput = `/* Generated from tokens/tarkov.json. Do not edit directly. */\nexport declare const TARKOV_TOKENS:${declaration(tokens)};\n`;

await Promise.all([
  writeFile(path.join(packageRoot, "src", "tokens.css"), cssLines.join("\n"), "utf8"),
  writeFile(path.join(packageRoot, "src", "tokens.js"), jsOutput, "utf8"),
  writeFile(path.join(packageRoot, "src", "tokens.d.ts"), dtsOutput, "utf8"),
]);
