# 词根解码 (etymology-book) 
https://kevinguo0351.github.io/etymology-book/
用构词法（词根 + 词缀 + 词源故事 + 语境）快速扩充英语**阅读/被动词汇**的 Quarto 书。

- 目标读者：词汇量 ~9k、想高效啃下学术/科技长尾词的中文母语者。
- 形式：Quarto book，HTML 优先；中文讲解 + 英文词例。
- 第一轮：~60 章（每章一个词根簇），每天一章 + 间隔复习，约两个月。

## 结构

```
_quarto.yml            # Quarto book 配置（HTML）
index.qmd              # 前言（含诚实预期）
chapters/method.qmd    # 学习方法 + 间隔复习
chapters/chNN-*.qmd    # 每章一个词根簇
appendix/affixes.qmd   # 词缀速查表
appendix/review-calendar.qmd
spine.md               # 全书骨架：词根清单 + 频率排序 + 60 章映射
scripts/               # 工具链（Node）：频率排序 / Anki / Eudic 导出
.github/workflows/     # CI：quarto render → GitHub Pages（本地无需装 Quarto）
```

## 工具链（Node，非 Python）

> 原计划用 Python，但本机未安装 Python（仅 MS Store 占位），而 Node v24 已就绪、且 Eudic 调用逻辑本就是 JS——故改用 Node。

- `npm run rank` — 按词频给词根排序（`scripts/rank_roots.mjs`）
- `npm run anki` — 生成每章 Anki `.apkg`（`scripts/build_anki.mjs`，待内容定稿后实现）
- `npm run eudic` — 把每章词表推送到欧路生词本（`scripts/export_eudic.mjs`，复用 context-vocab 的 Eudic 接口）

## 渲染

本地未装 Quarto；推送到 GitHub 后由 Actions 自动 `quarto render` 并发布到 Pages。
如需本地预览，安装 Quarto 后运行 `quarto preview`。

## 当前状态

Phase 1（脊柱 + 2 样章）已完成，等待审定后批量产章。
