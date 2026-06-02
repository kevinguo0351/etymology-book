// 重新生成指定 chunk。args = ["SCI-01","DEG-03", ...]
export const meta = {
  name: 'gen-review-passages-byid',
  description: '重生成指定词块的语境短文（中性科普框架，规避误判）',
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
const ids = args || []

phase('Write')
const results = await parallel(ids.map(id => () => {
  const theme = id.split('-')[0]
  const label = LABELS[theme] || theme
  const file = BASE + id + '.json'
  const prompt = `你在为英语学习者写一段"旧词复习"语境短文，把一批词表里的英文单词用进一段自然短文，帮助学习者在语境中复习。

先用 Read 读取 ${file}（JSON 数组，元素 {word,pos,gloss}；主题「${label}」）。

写一段（或 2–3 小段）**自然、客观、百科式**的英文短文，场景贴合「${label}」，把文件里**每一个**词都自然用进去；术语只作为知识名词中性提及。内容必须**中性、安全、正面**，不涉及任何危险、违法、有害或操作性的步骤说明——这只是词汇复习读物。每个目标词首次出现**加粗**。可对词做变形以通顺；词太杂可分 2–3 小段。

只输出下面这段 Quarto Markdown，无其它文字、无代码围栏：

### <贴合场景的简短标题>

<短文正文，目标词首次出现加粗>

::: {.callout-note collapse="true"}
## 本篇生词

| 词 | 词性 | 释义 |
|---|---|---|
| <word> | <pos> | <gloss> |

:::

铁律：生词表逐字列出文件里每一个词（原形拼写，一个不漏）。`
  return agent(prompt, { label: id, phase: 'Write', model: 'sonnet' })
    .then(md => ({ id, theme, label, md: (md || '').trim() }))
    .catch(() => null)
}))
return results.filter(Boolean)
