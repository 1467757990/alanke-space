---
title: "Markdown 语法参考（内部草稿）"
published: 2026-11-10
description: "站点维护者使用的 Markdown 语法示例集合，不作为公开文章发布。"
tags: [内部, Markdown]
category: 维护
draft: true
---

# Markdown 语法参考

本文是 `draft: true` 的内部参考页，用于保留 Shirone 扩展语法的最小示例，
不会被发布到生产站点。

## GitHub 卡片

::github{repo="LyraVoid/Shirone"}

## 数学公式

行内公式 $a^2 + b^2 = c^2$。

$$
\mathrm{EM} = \frac{1}{N}\sum_{i=1}^{N}\mathbf{1}[\hat{a}_i = a_i]
$$

## Mermaid

```mermaid
flowchart LR
  A[输入] --> B[处理]
  B --> C[输出]
```

## 步骤

:::steps{title="示例步骤"}
1. **第一步**

   说明文字。

2. **第二步**

   更多说明。
:::

## 折叠与提示

> [!NOTE] 提示
> 这是一个 GitHub 风格提示块。

## 图片网格

:::grid{columns="2" aspect="16/9" fit="cover"}
![占位图一](/assets/moments/coffee.webp)
![占位图二](/assets/moments/sky.webp)
:::

## 行内剧透

答案是 :spoiler[42]。

## 标记高亮

==这是一段标记高亮文本==
