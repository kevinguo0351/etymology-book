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

// 把加粗词替换成可悬停弹释义的行内 span（支持变形词→原形匹配）
const norm = s => String(s).toLowerCase().trim()
const stem = s => norm(s).replace(/(ings|ing|edly|ed|ements|ement|ation|tions|tion|ness|ies|es|ly|er|est|s|d)$/, '')
function buildMatcher(words) {
  const exact = new Map(), byStem = new Map()
  for (const w of words) {
    const def = `${w.word}${w.pos ? ' · ' + w.pos : ''} ${(w.gloss || '')}`.trim()
    exact.set(norm(w.word), def)
    const st = stem(w.word); if (!byStem.has(st)) byStem.set(st, def)
  }
  return bold => {
    const n = norm(bold)
    if (exact.has(n)) return exact.get(n)
    const st = stem(bold); if (byStem.has(st)) return byStem.get(st)
    for (const w of words) { const wn = norm(w.word); if (wn.length >= 4 && (n.startsWith(wn) || wn.startsWith(n))) return `${w.word}${w.pos ? ' · ' + w.pos : ''} ${(w.gloss || '')}`.trim() }
    return null
  }
}
function renderPassage(p) {
  const md = p.md || ''
  const cIdx = md.indexOf('::: {.callout-note')
  const head = (cIdx >= 0 ? md.slice(0, cIdx) : md).trim()
  const lines = head.split('\n')
  const ti = lines.findIndex(l => l.startsWith('### '))
  const title = ti >= 0 ? lines[ti].trim() : '### 语境短文'
  let bodyText = (ti >= 0 ? lines.slice(ti + 1) : lines).join('\n').trim()
  let words = []
  try { words = JSON.parse(fs.readFileSync(`data/chunks/${p.id}.json`, 'utf8')) } catch {}
  const match = buildMatcher(words)
  bodyText = bodyText.replace(/\*\*(.+?)\*\*/g, (m, x) => {
    const def = match(x)
    if (!def) return m
    const d = def.replace(/["\\\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
    return `[${x}]{.vocab tabindex="0" data-def="${d}"}`
  })
  return `${title}\n\n${bodyText}`
}

const pages = []
let totalPassages = 0
for (const code of ORDER) {
  const list = groups[code]
  if (!list || !list.length) continue
  totalPassages += list.length
  const body = [`# ${LABELS[code]} {.unnumbered}`, '',
    `> 本主题共 ${list.length} 篇语境短文。通读短文，**鼠标悬停（触屏点按）加粗词**即可弹出它的释义——先凭语境猜，再悬停对照。`, '',
    ...list.map(p => renderPassage(p))]
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
