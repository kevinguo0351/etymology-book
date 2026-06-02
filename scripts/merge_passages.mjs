// 用法: node scripts/merge_passages.mjs <orig-output.json> <regen-output.json> [<regen2> ...]
// 合并：以原始 232 篇为底，用后续重生成的同 id 覆盖；丢弃仍含 API Error 的篇。
// 输出 data/passages_final.json
import fs from 'node:fs'

function load(f) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  return (Array.isArray(j) ? j : j.result).filter(Boolean)
}
const files = process.argv.slice(2)
const map = new Map()
for (const f of files) {
  for (const p of load(f)) {
    if (/API Error|Usage Policy|unable to respond/i.test(p.md)) continue // 跳过失败篇
    map.set(p.id, p) // 后来的覆盖先前的
  }
}
const out = [...map.values()]
fs.writeFileSync('data/passages_final.json', JSON.stringify(out))
const stillBad = files.length // info
console.log('merged passages:', out.length)
console.log('wrote data/passages_final.json')
