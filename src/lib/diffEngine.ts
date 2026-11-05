export interface DiffLine {
  type: 'add' | 'del' | 'same';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  unified: DiffLine[];
  left: DiffLine[];
  right: DiffLine[];
  additions: number;
  deletions: number;
}

function splitLines(text: string): string[] {
  if (!text || text.length === 0) return [];
  return text.split(/\r?\n/);
}

export function computeMyersDiff(originalText: string, newText: string): DiffResult {
  const origLines = splitLines(originalText);
  const newLines = splitLines(newText);

  const n = origLines.length;
  const m = newLines.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (origLines[i] === newLines[j]) {
        lcs[i + 1][j + 1] = lcs[i][j] + 1;
      } else {
        lcs[i + 1][j + 1] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const unifiedRev: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === newLines[j - 1]) {
      unifiedRev.push({
        type: 'same',
        text: origLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      unifiedRev.push({
        type: 'add',
        text: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      unifiedRev.push({
        type: 'del',
        text: origLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  const unified = unifiedRev.reverse();
  let additions = 0;
  let deletions = 0;
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];

  for (const line of unified) {
    if (line.type === 'del') {
      deletions++;
      left.push(line);
      right.push({ type: 'same', text: '', oldLineNumber: undefined, newLineNumber: undefined });
    } else if (line.type === 'add') {
      additions++;
      left.push({ type: 'same', text: '', oldLineNumber: undefined, newLineNumber: undefined });
      right.push(line);
    } else {
      left.push(line);
      right.push(line);
    }
  }

  return {
    unified,
    left,
    right,
    additions,
    deletions,
  };
}
