# 词根解码 (etymology-book)

🌐 在线阅读：https://kevinguo0351.github.io/etymology-book/

用构词法（词根 + 词缀 + 词源故事 + 语境）快速扩充英语**阅读/被动词汇**的 Quarto 书。

- 目标读者：词汇量 ~9k、想高效啃下学术/科技长尾词的中文母语者。
- 形式：Quarto book，HTML 优先；中文讲解 + 英文词例。
- 用法：每天读固定章节 + 间隔复习（每章末有"今日复习"，按 N−1/−2/−4/−8/−16 回看）。

## 状态：已全部完成 ✅

- **正文 · 词根章节：80 章全部上线**（拉丁/希腊交替，每章一个词根簇 + 词源故事 + 派生词表 + 生动语境 + 助记 + 陷阱 + 今日复习；标题带「第N章」便于查阅）。
- **旧词复习 · 语境唤醒：已上线**——把约 6600 个旧生词按 22 个场景，编成 232 篇语境短文，每个加粗词**鼠标悬停（触屏点按）即弹出释义**，覆盖率 6632/6635。
- 附录：词缀速查表、复习日历。
- CI 在每次 push 后自动 `quarto render` 并发布到 GitHub Pages（本地无需安装 Quarto）。

## 结构

```
_quarto.yml              # Quarto book 配置（HTML，含两个部分）
index.qmd / chapters/method.qmd
chapters/chNN-*.qmd      # 80 章词根教学
review/                  # 旧词复习：22 个主题页 + index（悬停弹释义）
appendix/                # 词缀表、复习日历
styles.css               # 含 .vocab 悬停气泡、词源块样式
scripts/                 # Node 工具链：生成 / 拼装 / 导出
.github/workflows/       # CI：render → Pages
```

## 工具链（Node）

> 本机未装 Python，故全用 Node。章节与旧词复习均由并行 sub-agent workflow 生成，脚本负责解析/分桶/拼装。

这套方法已抽象成可复用的 Claude Code 技能：[vocabulary-builder](https://github.com/kevinguo0351/vocabulary-builder)。

## 本地预览（可选）

安装 Quarto 后 `quarto preview`；否则推送到 GitHub 由 CI 渲染。

## 神话与故事词源（60 天）

`myth/` 目录是〔韩〕金炯卓《英语单词超强记忆法（可复制）》（邢心秀、孟丽 译，上海社会科学院出版社）
扫描件的 OCR 还原版，共 6 章 60 天 + 12 个 Weekly Quiz + 全书答案，按原书结构组织，
并额外生成了全书词汇总表（1200 词条）与词源主题索引（547 个词源故事）。

它与正文的"词根解码"互补：词根解码靠构词零件*推断*生词，这一部分靠由来故事*记住*那些拆不开的词。
