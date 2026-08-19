import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";

describe("tokenize", () => {
  it("produces the same normalized token stream for renamed variables in Python", async () => {
    const original = "def add(a, b):\n    return a + b\n";
    const renamed = "def add(x, y):\n    return x + y\n";

    const originalTokens = await tokenize(original, "Python");
    const renamedTokens = await tokenize(renamed, "Python");

    expect(renamedTokens).toEqual(originalTokens);
  });

  it("produces a different token stream for genuinely different logic in Python", async () => {
    const addFn = "def add(a, b):\n    return a + b\n";
    const subtractFn = "def subtract(a, b):\n    return a - b\n";

    const addTokens = await tokenize(addFn, "Python");
    const subtractTokens = await tokenize(subtractFn, "Python");

    expect(subtractTokens).not.toEqual(addTokens);
  });

  it("produces the same normalized token stream for renamed variables in JavaScript", async () => {
    const original = "function add(a, b) { return a + b; }";
    const renamed = "function add(x, y) { return x + y; }";

    const originalTokens = await tokenize(original, "JavaScript");
    const renamedTokens = await tokenize(renamed, "JavaScript");

    expect(renamedTokens).toEqual(originalTokens);
  });

  it("produces the same normalized token stream for renamed variables in C", async () => {
    const original = "int add(int a, int b) { return a + b; }";
    const renamed = "int add(int x, int y) { return x + y; }";

    const originalTokens = await tokenize(original, "C");
    const renamedTokens = await tokenize(renamed, "C");

    expect(renamedTokens).toEqual(originalTokens);
  });

  it("produces the same normalized token stream for renamed variables in C#", async () => {
    const original = "class Calc { int Add(int a, int b) { return a + b; } }";
    const renamed = "class Calc { int Add(int x, int y) { return x + y; } }";

    const originalTokens = await tokenize(original, "C#");
    const renamedTokens = await tokenize(renamed, "C#");

    expect(renamedTokens).toEqual(originalTokens);
  });
});
