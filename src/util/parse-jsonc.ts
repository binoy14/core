/**
 * Strip single-line (//) and multi-line comments from JSONC,
 * and remove trailing commas before } or ] so that JSON.parse succeeds.
 * This avoids pulling in the entire TypeScript compiler just to parse tsconfig files.
 */
export function parseJsonc(text: string): unknown {
  let result = ''
  let i = 0
  let inString = false

  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (inString) {
      result += ch
      // skip escaped characters inside strings
      if (ch === '\\') {
        result += next ?? ''
        i += 2
        continue
      }

      if (ch === '"') inString = false
      i++
      continue
    }

    // entering a string
    if (ch === '"') {
      inString = true
      result += ch
      i++
      continue
    }

    // single-line comment
    if (ch === '/' && next === '/') {
      i += 2
      while (i < text.length && text[i] !== '\n') i++
      continue
    }

    // multi-line comment
    if (ch === '/' && next === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i += 2 // skip closing */
      continue
    }

    result += ch
    i++
  }

  // Remove trailing commas before } or ]
  result = result.replaceAll(/,\s*([}\]])/g, '$1')

  return JSON.parse(result)
}
