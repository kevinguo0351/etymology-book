// 把 data/oldwords.json (Eudic 导出) 清洗成 data/words_clean.json: [{word, pos, gloss}]
// 只保留 ≤3 词的词条(单词+短语)，去掉长句；提取主词性与简明中文释义。
import fs from 'node:fs'

const rows = JSON.parse(fs.readFileSync('data/oldwords.json', 'utf8'))
const POS_ORDER = ['n.', 'vt.', 'vi.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'int.', 'pron.', 'num.']
// 释义里这些标记之后是变形/派生信息，截断
const CUT = ['时 态', '时态', '名 词', '形容词', '副 词', '动 词', '复 数', '过 去', '过去式', '比较级', '最高级', '第三人称', '原 形', '现在分词', '过去分词', '复数']

function primaryPos(def) {
  let best = null, bestIdx = Infinity
  for (const p of POS_ORDER) {
    const i = def.indexOf(p)
    if (i !== -1 && i < bestIdx) { bestIdx = i; best = p }
  }
  return best || ''
}
function cleanGloss(def) {
  let g = def
  for (const c of CUT) { const i = g.indexOf(c); if (i !== -1) g = g.slice(0, i) }
  // 去掉词性标记本身，保留中文
  g = g.replace(/\b(n|vt|vi|v|adj|adv|prep|conj|int|pron|num)\.\s*/g, ' ').replace(/\s+/g, ' ').trim()
  g = g.replace(/^[;,；，\s]+/, '').trim()
  if (g.length > 50) g = g.slice(0, 50) + '…'
  return g
}

const seen = new Set()
const out = []
for (const r of rows) {
  const tokens = r.word.split(/\s+/).length
  if (tokens > 3) continue                 // 跳过长句
  const key = r.word.toLowerCase()
  if (seen.has(key)) continue              // 去重
  seen.add(key)
  out.push({ word: r.word, pos: primaryPos(r.def), gloss: cleanGloss(r.def) })
}
fs.writeFileSync('data/words_clean.json', JSON.stringify(out))
console.log('cleaned words:', out.length)
console.log('with pos:', out.filter(w => w.pos).length, '| with gloss:', out.filter(w => w.gloss).length)
console.log('samples:')
for (const w of out.slice(0, 6)) console.log(' ', JSON.stringify(w))
