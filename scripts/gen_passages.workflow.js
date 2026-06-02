// 旧词复习语境短文生成。args = { THEME_CODE: 该主题chunk数 }（如 {BIZ:9, SCI:15, ...}）。
// 脚本据此构造 chunk id/文件路径并扇出 agent；每个 agent 读自己的 chunk 文件，写一段主题短文。
export const meta = {
  name: 'gen-review-passages',
  description: '为每个词块生成语境短文（agent 读 chunk 文件，输出 qmd 片段）',
  phases: [{ title: 'Write' }],
}

const LABELS = {
  BIZ: '商业·金融·经济', SCI: '科学·技术·工程', NAT: '自然·环境·动植物',
  MED: '身体·健康·医学', EMO: '情绪·心理·感受', CON: '冲突·暴力·危险',
  LAW: '法律·政治·政府', FOOD: '饮食·烹饪·味道', ART: '艺术·音乐·文学',
  CHAR: '人物·性格·品质', MOV: '动作·方式', TIME: '时间·变化·过程',
  COMM: '言语·沟通·表达', ABS: '抽象·思维·概念', SOC: '社会·关系·家庭',
  APP: '外貌·服饰·外观', REL: '宗教·神话·灵性', GEO: '旅行·地点·建筑',
  WEA: '天气·水·天象', WORK: '劳动·工具·工艺', DEG: '程度·数量·修饰', MISC: '杂项·其他',
}
const BASE = 'C:\\Users\\guowenjie\\etymology-book\\data\\chunks\\'

const counts = args || {}
const CHUNKS = []
for (const code of Object.keys(LABELS)) {
  const n = counts[code] || 0
  for (let k = 1; k <= n; k++) {
    const id = `${code}-${String(k).padStart(2, '0')}`
    CHUNKS.push({ id, theme: code, label: LABELS[code], part: k, parts: n, file: BASE + id + '.json' })
  }
}

phase('Write')
const results = await parallel(CHUNKS.map(c => () => {
  const prompt = `你在为"旧词复习·语境唤醒"板块写一段语境短文，用一段自然英文把一批旧生词重新激活。

先用 Read 工具读取文件 ${c.file}（JSON 数组，元素为 {word,pos,gloss}；本篇主题：「${c.label}」）。

任务：写一段（或 2–3 小段）**自然、连贯、有画面感**的英文短文，场景贴合主题「${c.label}」，把文件里**每一个**词都自然用进去。可对词做时态/单复数/派生变形以保证通顺。每个目标词在正文中**首次出现时用 **加粗** 标记**。长度适中——能自然容纳即可，不要硬凑到读不通；若这批词较杂，可分 2–3 小段各成一景。

只输出下面这段 Quarto Markdown，不要任何额外文字或代码围栏：

### <一个贴合场景的简短标题>

<短文正文，目标词首次出现加粗>

::: {.callout-note collapse="true"}
## 本篇生词

| 词 | 词性 | 释义 |
|---|---|---|
| <word> | <pos> | <gloss> |

:::

铁律：生词表必须**逐字列出文件里的每一个词**（用原形拼写，与文件一致，一个都不能漏）——这是复习清单。`
  return agent(prompt, { label: c.id, phase: 'Write', model: 'sonnet' })
    .then(md => ({ id: c.id, theme: c.theme, label: c.label, part: c.part, parts: c.parts, md: (md || '').trim() }))
    .catch(() => null)
}))

return results.filter(Boolean)
