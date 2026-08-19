const K_GRAM_SIZE = 5;
const WINDOW_SIZE = 4;

function hashKGram(tokens: string[]): number {
  let hash = 0;
  for (const token of tokens) {
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    hash = (hash * 31 + 1) >>> 0;
  }
  return hash;
}

function kGramHashes(tokens: string[]): number[] {
  if (tokens.length < K_GRAM_SIZE) return [hashKGram(tokens)];
  const hashes: number[] = [];
  for (let i = 0; i <= tokens.length - K_GRAM_SIZE; i++) {
    hashes.push(hashKGram(tokens.slice(i, i + K_GRAM_SIZE)));
  }
  return hashes;
}

function winnow(hashes: number[]): Set<number> {
  const fingerprints = new Set<number>();
  if (hashes.length === 0) return fingerprints;
  if (hashes.length <= WINDOW_SIZE) {
    fingerprints.add(Math.min(...hashes));
    return fingerprints;
  }

  let previousMinIndex = -1;
  for (let i = 0; i <= hashes.length - WINDOW_SIZE; i++) {
    const window = hashes.slice(i, i + WINDOW_SIZE);
    let minIndexInWindow = 0;
    for (let j = 1; j < window.length; j++) {
      if (window[j] <= window[minIndexInWindow]) minIndexInWindow = j;
    }
    const minIndex = i + minIndexInWindow;
    if (minIndex !== previousMinIndex) {
      fingerprints.add(hashes[minIndex]);
      previousMinIndex = minIndex;
    }
  }
  return fingerprints;
}

export function fingerprint(tokens: string[]): Set<number> {
  return winnow(kGramHashes(tokens));
}

export function computeSimilarity(tokensA: string[], tokensB: string[]): number {
  const fingerprintsA = fingerprint(tokensA);
  const fingerprintsB = fingerprint(tokensB);

  if (fingerprintsA.size === 0 && fingerprintsB.size === 0) return 0;

  let intersectionSize = 0;
  for (const hash of fingerprintsA) {
    if (fingerprintsB.has(hash)) intersectionSize++;
  }

  const unionSize = fingerprintsA.size + fingerprintsB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}
