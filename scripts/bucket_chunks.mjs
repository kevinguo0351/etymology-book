// 用法: node scripts/bucket_chunks.mjs <tag-workflow-output.json>
// 读取主题标签结果 + words_clean.json，按主题分桶、每 ~30 词切块，
// 写 data/chunks/<THEME>_<k>.json 与 data/chunks_manifest.json
import fs from 'node:fs'

const LABELS = {
  BIZ: '商业·金融·经济', SCI: '科学·技术·工程', NAT: '自然·环境·动植物',
  MED: '身体·健康·医学', EMO: '情绪·心理·感受', CON: '冲突·暴力·危险',
  LAW: '法律·政治·政府', FOOD: '饮食·烹饪·味道', ART: '艺术·音乐·文学',
  CHAR: '人物·性格·品质', MOV: '动作·方式', TIME: '时间·变化·过程',
  COMM: '言语·沟通·表达', ABS: '抽象·思维·概念', SOC: '社会·关系·家庭',
  APP: '外貌·服饰·外观', REL: '宗教·神话·灵性', GEO: '旅行·地点·建筑',
  WEA: '天气·水·天象', WORK: '劳动·工具·工艺', DEG: '程度·数量·修饰', MISC: '杂项·其他',
}
const ORDER = Object.keys(LABELS)
const CHUNK = 30

const tagFile = process.argv[2]
const parsed = JSON.parse(fs.readFileSync(tagFile, 'utf8'))
const tags = Array.isArray(parsed) ? parsed : parsed.result
const words = JSON.parse(fs.readFileSync('data/words_clean.json', 'utf8'))

// 词 -> 主题（小写匹配；未知或非法代码 -> MISC）
const map = new Map()
for (const { w, t } of tags) {
  if (!w) continue
  const code = LABELS[t] ? t : 'MISC'
  map.set(String(w).toLowerCase(), code)
}
let tagged = 0
const buckets = Object.fromEntries(ORDER.map(c => [c, []]))
for (const wd of words) {
  let c = map.get(wd.word.toLowerCase())
  if (c) tagged++; else c = 'MISC'
  buckets[c].push(wd)
}

fs.rmSync('data/chunks', { recursive: true, force: true })
fs.mkdirSync('data/chunks', { recursive: true })
const manifest = []
for (const code of ORDER) {
  const list = buckets[code]
  if (!list.length) continue
  const nChunks = Math.ceil(list.length / CHUNK)
  for (let k = 0; k < nChunks; k++) {
    const part = list.slice(k * CHUNK, (k + 1) * CHUNK)
    const id = `${code}-${String(k + 1).padStart(2, '0')}`
    const file = `data/chunks/${id}.json`
    fs.writeFileSync(file, JSON.stringify(part))
    manifest.push({
      id, theme: code, label: LABELS[code],
      file: `C:\\Users\\guowenjie\\etymology-book\\${file.replace(/\//g, '\\')}`,
      part: k + 1, parts: nChunks, count: part.length,
    })
  }
}
fs.writeFileSync('data/chunks_manifest.json', JSON.stringify(manifest, null, 0))

console.log('tagged words matched:', tagged, '/', words.length)
console.log('themes used:', ORDER.filter(c => buckets[c].length).length)
console.log('total chunks:', manifest.length)
console.log('per-theme counts:')
for (const c of ORDER) if (buckets[c].length) console.log(`  ${c} ${LABELS[c]}: ${buckets[c].length} words -> ${Math.ceil(buckets[c].length / CHUNK)} chunks`)
