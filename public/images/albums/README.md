# 相册目录

每个子目录是一个相册。第一版图片全部保存在本地，不依赖 R2 或外部图床。

当前相册：

| 目录 | 主题 |
| --- | --- |
| `daily-life` | 日常生活 |
| `campus-notes` | 校园记录 |
| `travel-light` | 旅行 |
| `desk-setup` | 桌面与设备 |
| `snapshots` | 随手拍 |

## 本地模式

```text
<album-id>/
├── info.json       # 必填：title / date / tags 等
├── cover.webp      # 必填：封面
└── *.webp          # 其余照片，文件名中的下划线后内容会作为标签
```

`info.json` 示例：

```json
{
  "title": "日常生活",
  "description": "日常碎片。",
  "date": "2026-10-18",
  "location": "杭州",
  "tags": ["日常生活", "生活"],
  "layout": "masonry",
  "columns": 3,
  "hidden": false
}
```

## 外部模式（为 R2 预留）

设置 `"mode": "external"`，并提供 `cover` 与 `photos[]`（每项至少 `src`）。
相册扫描器会直接使用远程地址，不需要改组件，也不强制依赖 Cloudflare R2。
详见 [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) 第 8 节。

## 替换演示图片

当前 5 个相册的图片均为生成的占位图，可以直接替换同名 WebP 文件，或在 `info.json` 中更换元数据。
替换后运行 `pnpm build` 重新生成站点。
