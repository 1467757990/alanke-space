---
title: "LLM 评测笔记：如何描述一次实验"
published: 2026-10-12
description: "Demo 示例文章：LLM 实验记录的最小信息集，以及为什么不应编造指标。"
image: /assets/posts/llm-evaluation.webp
tags: [LLM, 评测, 科研笔记, Demo]
category: 科研笔记
draft: false
---

> [!NOTE] Demo 示例
> 本文不报告任何真实实验结论。示例数字仅用于说明记录格式。

## 一次实验至少应该记录什么

当别人（或三个月后的自己）看到一份结果时，至少需要知道：

- 数据来源、规模、划分方式；
- 基线模型与提示词版本；
- 解码参数与随机种子；
- 评价指标及其计算脚本；
- 失败案例的处理方式。

缺少任何一项，结果都很难被复现或比较。

## 指标不是单一数字

以问答任务为例，可以同时观察：

$$
\text{EM} = \frac{1}{N}\sum_{i=1}^{N}\mathbf{1}[\hat{a}_i = a_i]
$$

精确匹配（EM）对表面形式很敏感，而 F1 更关注词级重叠。两者都可能忽略语义等价。
因此，报告指标时应说明分词、归一化和判定规则，而不是只给一个百分数。

## 小样本实验的陷阱

在小规模开发集上，几个样本的差异就可能让指标波动很大。可以用 bootstrap 估计置信区间，
并在结论中明确“这只是一次开发集观察，尚未进行正式评测”。

```python
import random
import statistics


def bootstrap_mean(values: list[float], rounds: int = 1000) -> tuple[float, float]:
    means = []
    for _ in range(rounds):
        sample = [random.choice(values) for _ in values]
        means.append(statistics.fmean(sample))
    means.sort()
    return means[int(0.025 * rounds)], means[int(0.975 * rounds)]
```

## 不编造结果

写作时最容易发生的错误，是为了让文章“完整”而补上并不存在的数字、对比或论文引用。
如果结果尚未产生，就明确写“待补充”；如果引用了别人的工作，就给出可核查的出处。
诚实描述限制，比一个漂亮但无法复现的表格更有价值。

## 结语

评测记录的目标不是证明方法有效，而是让读者能够判断：在什么条件下、基于什么证据，
得出了什么结论。把不确定性写清楚，本身就是研究的一部分。
