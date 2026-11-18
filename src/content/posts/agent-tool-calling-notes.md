---
title: "Agent 与 Tool Calling：先把边界画清楚"
published: 2026-10-30
description: "Demo 示例文章：智能体工具调用的设计边界、错误处理与可观测性笔记。"
image: /assets/posts/agent-tool-calling.webp
tags: [Agent, Tool Calling, LLM, Demo]
category: Agent
draft: false
---

> [!NOTE] Demo 示例
> 本文是通用设计笔记，用于演示代码块、列表和文章目录，不代表任何真实系统实现。

## 工具不是函数越多越好

给智能体接入工具时，最容易犯的错误是“把所有内部 API 都暴露出去”。工具数量增加后，
模型选择成本、参数填错概率和权限风险都会上升。更合理的起点是：

- 每个工具只做一件边界清晰的事；
- 参数尽量少，并且有类型与范围约束；
- 返回值包含结构化错误，而不是直接抛异常；
- 对高风险操作要求显式确认。

## 一个最小可用的工具协议

```ts
type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

async function runTool<T>(
  name: string,
  input: unknown,
): Promise<ToolResult<T>> {
  try {
    const parsed = validate(name, input);
    return { ok: true, data: await execute(name, parsed) };
  } catch (error) {
    return {
      ok: false,
      code: "TOOL_FAILED",
      message: error instanceof Error ? error.message : "unknown error",
    };
  }
}
```

把错误当作协议的一部分，模型才有机会根据错误类型调整策略。否则它只能看到一段
无法理解的堆栈，然后重复同一次失败调用。

## 循环与终止条件

一个常见的执行循环是“模型决定调用工具 → 执行 → 把结果回填 → 模型继续”。
必须为这个循环设置明确的上限：

1. 最大步数；
2. 最大总耗时；
3. 连续失败次数；
4. 是否需要人工确认。

没有终止条件的 Agent 很容易在工具报错时反复重试。把预算写进运行时，而不是只写在提示词里。

## 可观测性

至少记录每次运行的：

- 用户输入与系统提示的版本；
- 每一步的模型输出；
- 工具名、参数、耗时与结果摘要；
- 最终停止原因。

这些记录不仅是调试材料，也是后续评估与回归测试的基础。

## 小结

Agent 的可靠性更多来自工程约束，而不是更长的提示词。先定义工具边界、错误协议和停止条件，
再考虑多智能体、长期记忆等更复杂的结构。
