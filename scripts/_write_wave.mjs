// 把某次 Workflow 的输出(JSON 数组: [{n, roots, origin, md}, ...])写成 chapters/chNN-slug.qmd
// 用法: node scripts/_write_wave.mjs <workflow-output-file>
import fs from 'node:fs'
import path from 'node:path'

const SLUGS = {
  3: 'port', 4: 'log', 5: 'dict', 6: 'phon', 7: 'duc',
  8: 'scope', 9: 'fer', 10: 'meter', 11: 'mit', 12: 'bio',
  13: 'pos', 14: 'geo', 15: 'tract', 16: 'chrono', 17: 'scrib',
  18: 'path', 19: 'ven', 20: 'psych', 21: 'ten', 22: 'therm',
  23: 'cap', 24: 'photo', 25: 'ced', 26: 'auto', 27: 'struct',
  28: 'phil', 29: 'form', 30: 'micro', 31: 'vert', 32: 'tele',
  33: 'ject', 34: 'nom', 35: 'sta', 36: 'anthrop', 37: 'spir',
  38: 'demo', 39: 'vid', 40: 'arch', 41: 'mot', 42: 'crat',
  43: 'pend', 44: 'morph', 45: 'clud', 46: 'soph', 47: 'pel',
  48: 'theo', 49: 'cred', 50: 'phys', 51: 'fid', 52: 'onym',
  53: 'flu', 54: 'gnos', 55: 'rupt', 56: 'poly', 57: 'flect',
  58: 'mono', 59: 'fract', 60: 'syn', 61: 'gen', 62: 'hyper',
  63: 'aud', 64: 'hetero', 65: 'voc', 66: 'derm', 67: 'viv',
  68: 'neuro', 69: 'cur', 70: 'cardi', 71: 'sequ', 72: 'phob',
  73: 'sens', 74: 'pseudo', 75: 'val', 76: 'hydro', 77: 'sci',
  78: 'cid', 79: 'man', 80: 'nov',
}

const file = process.argv[2]
const text = fs.readFileSync(file, 'utf8')
const parsed = JSON.parse(text)
// Workflow 输出文件是 {summary, agentCount, logs, result:[...]}；也兼容直接是数组
const chapters = Array.isArray(parsed) ? parsed : parsed.result

const outDir = path.resolve('chapters')
let written = []
for (const ch of chapters) {
  if (!ch || !ch.md) continue
  const slug = SLUGS[ch.n] || `ch${ch.n}`
  const fname = `ch${String(ch.n).padStart(2, '0')}-${slug}.qmd`
  let md = ch.md.trim()
  if (!md.endsWith('\n')) md += '\n'
  fs.writeFileSync(path.join(outDir, fname), md, 'utf8')
  written.push(fname)
}
console.log('WROTE:\n' + written.join('\n'))
