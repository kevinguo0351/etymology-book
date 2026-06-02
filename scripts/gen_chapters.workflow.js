// 可复用的章节生成 workflow。章节规格通过 Workflow 的 `args` 传入（JSON 数组）。
// 每个 spec: { n, roots, gloss, origin:'L'|'G', latin?, greek?, seed }
export const meta = {
  name: 'gen-chapters',
  description: '生成词根书章节（规格经 args 传入），每 agent 产一章 .qmd',
  phases: [{ title: 'Generate', detail: '并行生成多章' }],
}

const STYLE = `
你是一位英语词源教科书作者，为中文母语、词汇量约9k的读者写一本"用构词法快速扩充阅读词汇"的书。
现在写其中一章。**只输出该章的 Quarto .qmd 正文 Markdown，不要代码围栏、不要任何解释性前后缀。**

严格遵守下面的格式（与已定稿章节一致）：

1) 标题行：# <词根所有变体用 / 隔开> —— "<中文核心义>"
2) 紧接 root-banner 容器：
::: {.root-banner}
<root1> · <root2> = <英文 gloss> <中文义>
:::
3) 一行"来源："说明拉丁语/希腊语原词与本义。
4) etymo 容器讲词源故事（中文叙事，有画面感、好记，2-4 段）：
::: {.etymo}
**词源故事：<小标题>**

<正文>
:::
5) 若【拉丁根】：一小段讲"前缀决定方向，根永远是同一个动作"，可配一个前缀方向小表。
   若【希腊根】：给一个"搭档根"Markdown 表（| 搭档根 | 含义 | 组合示例 |），列 6-10 个。
6) ## 核心派生词 —— Markdown 表，列 **30–50 个词**：
   | 词 | 词性 | 拆解 | 释义 | 频率 |
   - 词写成 [word]{.headword}
   - 拆解用反引号包词缀/根并标中文义，如 \`re-\`(回)+\`spect\`(看)
   - 频率三档：[高频]{.freq .freq-1} / [中频]{.freq .freq-2} / [低频]{.freq .freq-3}（按实际使用频率诚实标注）
7) ## 生动语境 —— ex 容器，4-6 个英文例句，目标词 **粗体**，括号给中文点拨：
::: {.ex}
- <英文句，含 **目标词**>（<中文点拨>）
:::
8) mnemonic 容器给助记钩子：
::: {.mnemonic}
**助记**：<方法>
:::
9) 若有值得警示的语义漂移/假同源，加 trap 容器（**必须区分**"高产可推断词根"与"仅供有趣的历史趣闻"，提醒别用趣闻推断词义）：
::: {.trap}
**陷阱**：<内容>
:::
10) 结尾 review-today 容器（今日复习），列出应回看的章号。

准确性：词源以权威词源学（Etymonline 等）为准，**不得编造民间词源**；不确定宁可不写。
篇幅充实但好读，中文讲解 + 英文词例。
`

function reviewList(n) {
  return [n - 1, n - 2, n - 4, n - 8, n - 16].filter(x => x >= 1)
}

const CHAPTERS = args || []
phase('Generate')

const results = await parallel(CHAPTERS.map(ch => () => {
  const rv = reviewList(ch.n)
  const rvText = rv.length
    ? `本章是第 ${ch.n} 章。今日复习应回看第 ${rv.join('、')} 章（均已存在）。在 review-today 容器里明确列出这些章号，并给本章几个代表词的自测提示。`
    : `本章是第 ${ch.n} 章，暂无旧章可复习。`
  const originText = ch.origin === 'L'
    ? `这是【拉丁根】，来源拉丁语 ${ch.latin}。突出"前缀换方向、根不变"，助记里把前缀映射成方向。`
    : `这是【希腊根】，来源希腊语 ${ch.greek}。突出"领域根互相拼搭"，务必给出"搭档根"表。`
  const prompt = `${STYLE}

====== 本章任务 ======
词根：${ch.roots}
中文核心义：${ch.gloss}
${originText}

选词与内容种子（在此基础上扩展到 30–50 个 drilled 词，旗舰词必须涵盖，可自行补充常见派生词）：
${ch.seed}

复习排程：${rvText}

只输出 .qmd 正文，从 "# ${ch.roots} —— ..." 开始，不要代码围栏或额外说明。`
  return agent(prompt, { label: `ch${String(ch.n).padStart(2, '0')}-${String(ch.roots).split(' ')[0]}`, phase: 'Generate', model: 'sonnet' })
    .then(md => ({ n: ch.n, roots: ch.roots, origin: ch.origin, md }))
}))

return results.filter(Boolean)
