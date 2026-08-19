import { describe, expect, it } from "vitest";
import { computeSimilarity } from "./winnowing";

describe("computeSimilarity", () => {
  it("scores identical token streams as 100% similar", () => {
    const tokens = ["def", "IDENT", "(", "IDENT", ")", ":", "return", "IDENT"];

    const similarity = computeSimilarity(tokens, tokens);

    expect(similarity).toBe(1);
  });

  it("scores completely disjoint token streams as 0% similar", () => {
    const tokensA = ["def", "IDENT", "(", ")", ":", "return", "IDENT"];
    const tokensB = ["class", "IDENT", ":", "pass"];

    const similarity = computeSimilarity(tokensA, tokensB);

    expect(similarity).toBe(0);
  });

  it("scores high similarity for token streams that differ only in a few tokens", () => {
    const tokensA = ["def", "IDENT", "(", "IDENT", ",", "IDENT", ")", ":", "return", "IDENT", "+", "IDENT"];
    const tokensB = ["def", "IDENT", "(", "IDENT", ",", "IDENT", ")", ":", "return", "IDENT", "-", "IDENT"];

    const similarity = computeSimilarity(tokensA, tokensB);

    expect(similarity).toBeGreaterThan(0.5);
  });

  it("scores a renamed-variable copy as highly similar and an unrelated solution as dissimilar (Python, via tokenizer)", async () => {
    const { tokenize } = await import("./tokenizer");
    const original = "def add(a, b):\n    result = a + b\n    return result\n";
    const renamedCopy = "def add(x, y):\n    total = x + y\n    return total\n";
    const unrelated = "def is_even(n):\n    return n % 2 == 0\n";

    const originalTokens = await tokenize(original, "Python");
    const copyTokens = await tokenize(renamedCopy, "Python");
    const unrelatedTokens = await tokenize(unrelated, "Python");

    const copySimilarity = computeSimilarity(originalTokens, copyTokens);
    const unrelatedSimilarity = computeSimilarity(originalTokens, unrelatedTokens);

    expect(copySimilarity).toBeGreaterThan(unrelatedSimilarity);
    expect(copySimilarity).toBeGreaterThanOrEqual(0.4);
  });
});
