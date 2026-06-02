import fs from 'node:fs'

const passage = `### Patterns, Cells, and Numbers: A Scientific Miscellany

Mathematics offers a language for describing the world. A **polynomial** expresses a quantity as a sum of powers, each scaled by a **coefficient**, while the ratio at the heart of a fraction is named by its **denominator**. Ancient geometers such as **Pythagoras** uncovered relationships among numbers that still anchor modern theory, and Einstein's theory of **relativity** later reshaped how physicists treat space and time. Statisticians measure how two variables move together through **correlation**, and when a process unfolds with inherent randomness they call it **stochastic**; to estimate uncertainty they may rely on **resampling**, drawing repeatedly from observed data. From a limited sample one can cautiously **extrapolate** to unobserved cases. The **cardinality** of a set counts its members, and computations spread over many machines are described as **distributed**. A spinning system shows a **centrifugal** tendency outward, and when opposing forces balance, it reaches **equilibrium**.

Biology and chemistry supply their own vocabulary. Inside a plant cell, the **chloroplast** houses **chlorophyll**, the green pigment that captures light to **synthesize** sugars; a simple sugar is one kind of **saccharide**. Genetic information is stored in DNA, whose backbone contains **deoxyribose** and whose rungs pair a **pyrimidine** base with its complement, all packaged into **chromosomal** structures. When two alleles are both fully expressed, geneticists speak of **codominance**, and an organism carrying four chromosome sets is **tetraploid**. Some solids form orderly **crystalline** lattices, while a **surfactant** molecule lowers surface tension at a boundary. Pharmacologists have characterized many natural compounds, among them **psilocybin**, a substance found in certain fungi and studied in the laboratory. Organisms whose activity cycles several times a day are termed **polyphasic**, and a botanical specimen lacking a spur is described, in technical Latin, as **excalcarate**.

Computing and the social sciences round out the survey. A programmer may **concatenate** two strings into one, or **encapsulate** related data and behaviour inside a single unit. Meanwhile a **demographer** studies how populations change — birth, migration, and age structure — turning messy human reality into measurable trends.`

const words = JSON.parse(fs.readFileSync('data/chunks/SCI-11.json', 'utf8'))
const rows = words.map(w => `| ${w.word} | ${w.pos || ''} | ${w.gloss || ''} |`).join('\n')
const md = `${passage}

::: {.callout-note collapse="true"}
## 本篇生词

| 词 | 词性 | 释义 |
|---|---|---|
${rows}

:::`

const arr = JSON.parse(fs.readFileSync('data/passages_final.json', 'utf8'))
const filtered = arr.filter(p => p.id !== 'SCI-11')
filtered.push({ id: 'SCI-11', theme: 'SCI', label: '科学·技术·工程', part: 11, parts: 15, md })
fs.writeFileSync('data/passages_final.json', JSON.stringify(filtered))
console.log('injected SCI-11; total passages now', filtered.length)
