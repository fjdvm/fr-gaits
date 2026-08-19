import { Parser, Language, type Node } from "web-tree-sitter";
import { readFile } from "fs/promises";
import path from "path";

export type SupportedLanguage = "Python" | "JavaScript" | "C" | "C#";

const GRAMMAR_PATHS: Record<SupportedLanguage, string> = {
  Python: path.join(
    process.cwd(),
    "node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-python.wasm"
  ),
  JavaScript: path.join(
    process.cwd(),
    "node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-javascript.wasm"
  ),
  C: path.join(process.cwd(), "lib/similarity/grammars/tree-sitter-c.wasm"),
  "C#": path.join(
    process.cwd(),
    "node_modules/@vscode/tree-sitter-wasm/wasm/tree-sitter-c-sharp.wasm"
  ),
};

const IDENTIFIER_NODE_TYPES = new Set(["identifier", "type_identifier"]);

let initPromise: Promise<void> | null = null;
const languageCache = new Map<SupportedLanguage, Promise<Language>>();

async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = Parser.init();
  }
  await initPromise;
}

async function loadLanguage(language: SupportedLanguage): Promise<Language> {
  let cached = languageCache.get(language);
  if (!cached) {
    cached = (async () => {
      const bytes = await readFile(GRAMMAR_PATHS[language]);
      return Language.load(bytes);
    })();
    languageCache.set(language, cached);
  }
  return cached;
}

export async function tokenize(code: string, language: SupportedLanguage): Promise<string[]> {
  await ensureInitialized();
  const lang = await loadLanguage(language);

  const parser = new Parser();
  parser.setLanguage(lang);
  const tree = parser.parse(code);
  if (!tree) return [];

  const tokens: string[] = [];
  collectTokens(tree.rootNode, tokens);
  return tokens;
}

function collectTokens(node: Node, tokens: string[]): void {
  if (node.childCount === 0) {
    if (IDENTIFIER_NODE_TYPES.has(node.type)) {
      tokens.push("IDENT");
    } else if (node.isNamed) {
      tokens.push(node.type);
    } else {
      tokens.push(node.text);
    }
    return;
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) collectTokens(child, tokens);
  }
}
