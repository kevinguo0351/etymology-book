// 用法: node scripts/assemble_review.mjs <gen-workflow-output.json>
// 把生成的短文按主题拼成 review/<CODE>.qmd，写 review/index.qmd，并做覆盖率检查。
import fs from 'node:fs'
import path from 'node:path'

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

const genFile = process.argv[2]
const parsed = JSON.parse(fs.readFileSync(genFile, 'utf8'))
const passages = (Array.isArray(parsed) ? parsed : parsed.result).filter(Boolean)
const byId = new Map(passages.map(p => [p.id, p]))

// 分组
const groups = {}
for (const p of passages) (groups[p.theme] ||= []).push(p)
for (const t in groups) groups[t].sort((a, b) => a.part - b.part)

// Windows 保留名 CON 不能作文件名(CON.qmd)，单独删除并改名
const RESERVED = { CON: 'CONFLICT' }
const safeName = code => RESERVED[code] || code
try { fs.rmSync('\\\\?\\' + path.resolve('review', 'CON.qmd'), { force: true }) } catch {}
fs.rmSync('review', { recursive: true, force: true })
fs.mkdirSync('review', { recursive: true })

const pages = []
let totalPassages = 0
for (const code of ORDER) {
  const list = groups[code]
  if (!list || !list.length) continue
  totalPassages += list.length
  const body = [`# ${LABELS[code]} {.unnumbered}`, '',
    `> 本主题共 ${list.length} 篇语境短文。每篇把一批旧词织进一个场景；目标词**加粗**，展开"本篇生词"可遮释义自测。`, '',
    ...list.map(p => p.md)]
  const fname = `review/${safeName(code)}.qmd`
  fs.writeFileSync(fname, body.join('\n\n') + '\n')
  pages.push({ code, fname, label: LABELS[code], passages: list.length })
}

// 覆盖率检查：每个 chunk 的词是否出现在对应短文里
let totalWords = 0, missing = 0
const missByChunk = []
for (const f of fs.readdirSync('data/chunks')) {
  const id = f.replace('.json', '')
  const words = JSON.parse(fs.readFileSync(path.join('data/chunks', f), 'utf8'))
  const p = byId.get(id)
  const hay = (p?.md || '').toLowerCase()
  const miss = []
  for (const w of words) { totalWords++; if (!hay.includes(w.word.toLowerCase())) { miss.push(w.word); missing++ } }
  if (miss.length) missByChunk.push(`${id}: ${miss.length} missing${p ? '' : ' (NO PASSAGE)'} -> ${miss.slice(0, 6).join(', ')}`)
}

// index
fs.writeFileSync('review/index.qmd', `# 旧词复习 · 语境唤醒 {.unnumbered}

这一部分不教新词根，而是把你过去积累、却没真正记牢的**约 ${totalWords} 个旧词**重新激活。

做法：把这些词按场景分组，用一篇篇**自然的英文短文**把它们串起来——在语境里再遇见，比孤立背单词更容易唤醒记忆。

**怎么用**

- 通读短文，遇到**加粗**的就是你的旧词；先别看释义，凭语境回忆词义。
- 每篇末尾"本篇生词"可折叠展开，作自测与对照。
- 按主题浏览左侧目录，挑你薄弱的场景先读。

共 ${totalPassages} 篇短文，覆盖 ${totalWords} 个旧词。
`)

console.log('theme pages:', pages.length, '| total passages:', totalPassages)
console.log('coverage:', (totalWords - missing), '/', totalWords, 'words present (', missing, 'missing )')
if (missByChunk.length) { console.log('chunks with misses:', missByChunk.length); missByChunk.slice(0, 15).forEach(x => console.log('  ', x)) }
console.log('--- _quarto.yml part block ---')
console.log('    - part: "旧词复习 · 语境唤醒"')
console.log('      chapters:')
console.log('        - review/index.qmd')
for (const p of pages) console.log(`        - ${p.fname}`)
