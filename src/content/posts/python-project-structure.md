---
title: "Python 项目结构：从脚本到可维护的小工程"
published: 2026-10-22
description: "Demo 示例文章：一个不过度设计的 Python 项目目录与配置约定。"
image: /assets/posts/python-structure.webp
tags: [Python, 工程实践, Demo]
category: Python
draft: false
---

> [!NOTE] Demo 示例
> 这是一篇工程实践示例，不包含真实项目代码或生产数据。

## 从单文件开始的时机

不是所有项目都需要完整的分层。一个几十行的脚本，拆成十个模块只会增加阅读成本。
当出现下面几个信号时，才值得开始整理结构：

- 需要在多个入口复用同一段逻辑；
- 测试开始依赖运行顺序；
- 配置、数据和业务逻辑混在一个文件里；
- 新同事需要花很久才能找到改哪里。

## 一个克制的目录

```text
project/
├── pyproject.toml
├── README.md
├── src/
│   └── project/
│       ├── __init__.py
│       ├── config.py
│       ├── models.py
│       └── pipeline.py
└── tests/
    ├── test_models.py
    └── test_pipeline.py
```

`src/` 布局的好处是避免“当前目录恰好可导入”的假象，让安装后的导入路径与开发时一致。
如果项目只是一个内部脚本集合，平铺目录也完全可以。

## 配置与密钥

配置读取应集中在一个模块，并对缺失项给出明确错误：

```python
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    api_base: str
    timeout: float = 30.0

    @classmethod
    def from_env(cls) -> "Settings":
        base = os.getenv("API_BASE")
        if not base:
            raise RuntimeError("API_BASE is required")
        return cls(api_base=base)
```

密钥不要写进仓库，也不要在日志里打印完整值。`.env` 只用于本地开发，并加入 `.gitignore`。

## 依赖管理

把运行时依赖与开发依赖分开，锁定可复现的版本。对于小型项目，
`pyproject.toml` + 一个锁文件通常已经足够，不需要引入复杂的构建体系。

## 测试的边界

优先测试纯函数和数据转换，其次测试关键路径，最后才考虑端到端测试。
测试的价值在于快速反馈，而不是覆盖率数字本身。

## 小结

好的结构应该让改动更集中、让错误更早暴露，而不是让目录看起来“专业”。
从问题出发，够用就好。
