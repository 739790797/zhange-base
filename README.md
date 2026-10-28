# zhange-base

`zhange-base` 是 `zhange-app` 桌面端和 `zhange-stats` Web 端共用基础代码的唯一来源。两个应用继续保留各自的仓库、运行时、页面和业务边界；本仓库不合并或发布应用。

## 边界

代码只有同时满足以下条件才属于基础公共代码：

- 两个应用都需要它，或有明确的近期双端复用场景。
- 不依赖某一端的页面框架、运行时或业务状态。
- 有稳定、明确的源码接口；修改时能在 App 和 Stats 两端验证。

基础仓可以包含设计令牌、框架无关的主题 CSS、字体入口与许可证、可访问的基础 CSS 控件，以及生成这些文件的工具。

以下内容留在各自应用仓库：页面布局和 React 组件、Ant Design 适配、路由与业务状态、Stats 的 FastAPI/API/数据库代码、App 的 Tauri/Rust/本机能力，以及只被一端使用的工具或样式。

不要把“相似”当作共享理由。只有两端确实共用且能保持平台无关的实现才放进本仓库；业务适配和页面差异由各自应用维护。

## 当前公共代码

当前只有 `design-system/`：

- `design-system/tokens/tarkov.json` 是 Tarkov 视觉令牌的唯一源文件。
- `design-system/src/tokens.css`、`tokens.js` 和 `tokens.d.ts` 是生成产物，不手工编辑。
- `design-system/src/index.css` 组合令牌、字体和基础控件样式。
- `design-system/src/fonts.css` 从 Fontsource 加载 IBM Plex Sans、IBM Plex Mono、Noto Sans SC 和 Rajdhani。
- `design-system/src/primitives.css` 提供框架无关、带焦点和禁用状态的基础控件样式。
- `design-system/licenses/fonts/` 保留随字体分发的许可证文本。

令牌变更后，在仓库根目录运行：

```bash
node design-system/scripts/generate-tokens.mjs
```

该命令会更新 `design-system/src/tokens.css`、`tokens.js` 和 `tokens.d.ts`。提交前运行只读检查，确认三份产物与令牌源一致：

```bash
node design-system/scripts/generate-tokens.mjs --check
```

检查会在产物缺失或过期时以非零状态退出，不会修改文件；仓库 CI 也会运行此检查。令牌或公共样式变更后，还需在 App、Stats 两端分别构建验证。消费者直接声明 `fonts.css` 使用的 Fontsource 依赖；本仓库不是 npm 包，不通过 npm registry 向消费者传递依赖。

文本格式使用仓库根 `.editorconfig` 与 `.prettierrc.json`；令牌生成产物由生成器管理，不使用 Prettier 重写。CI 检查命令为 `npx --yes prettier@3.6.2 --check . --ignore-path .prettierignore`。

## 消费与更新

App 和 Stats 通过 Git 子模块检出本仓库，子模块指针固定它们使用的提交。开发者首次克隆时使用 `git clone --recurse-submodules`；已有检出可运行 `git submodule update --init --recursive`。CI 的前端构建也必须初始化子模块。

消费者通过 `@zhange-base/src/index.css` 导入组合样式；需要 JavaScript 令牌时从 `@zhange-base/src/tokens.js` 导入。当前 `design-system/src/` 中这两个文件及其声明构成消费者公开的源码入口。修改公共代码时，先在本仓库提交并推送，再分别在 App 和 Stats 更新子模块指针；两端都通过对应构建后，更新才算完成。不要在消费者仓库复制或本地覆盖基础仓源码。

## 增加公共模块

新增模块前，确认两个应用都确实需要它、边界不依赖任一应用的业务/运行时，并为它定义稳定的源码入口和验证方式。若实现只属于 Web 或桌面端，就留在对应应用仓库，不扩张基础仓职责。
