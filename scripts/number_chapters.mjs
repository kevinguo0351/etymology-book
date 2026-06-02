// 给每章标题加章号："# spec ... —— ..."  →  "# 第N章　spec ... —— ..."
// N 取自文件名 chNN-...。幂等：已带"第N章"前缀的跳过。
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve('chapters')
const files = fs.readdirSync(dir).filter(f => /^ch\d{2}-.*\.qmd$/.test(f)).sort()
let changed = []
for (const f of files) {
  const n = parseInt(f.slice(2, 4), 10)
  const p = path.join(dir, f)
  const lines = fs.readFileSync(p, 'utf8').split('\n')
  const i = lines.findIndex(l => l.startsWith('# '))
  if (i === -1) { console.log('NO H1:', f); continue }
  if (/^#\s+第\d+章/.test(lines[i])) continue // 已编号，跳过
  lines[i] = lines[i].replace(/^#\s+/, `# 第${n}章　`)
  fs.writeFileSync(p, lines.join('\n'), 'utf8')
  changed.push(`${f}: ${lines[i]}`)
}
console.log(`numbered ${changed.length} files`)
console.log(changed.slice(0, 5).join('\n'))
console.log('...')
console.log(changed.slice(-3).join('\n'))
