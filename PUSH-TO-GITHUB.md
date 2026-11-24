# pointPdf-builder 上 DSH 市场 — 剩余步骤

本地已全部就绪，两个 commit：

```
c34b670  fix: restore 编程文档.md and ignore IDEA files
1deaf79  feat: package as DSH skill bundle with build script (5 templates)
adea7a9  Initial commit (原有)
```

本地验证全通过：

- `dsh plugin add file:...` 装入临时 profile 成功，无 BOM/校验错
- profile compose 识别 `pointpdf-skill-filesystem`
- `skills/pointpdf/SKILL.md` + 19 个模板文件就位
- 构建脚本三模板实测：输出含姓名、CSS 内联、无残留脚本
- JSON/SVG/frontmatter 全部合法，package.json 无 BOM

---

## 第一步：用 IDEA push

这个仓库 branch 是 **`main`**（不像 news 是 master）。

IDEA 里打开 `D:\BaiduNetdiskDownload\deepseek-windows64\Programs\pointPdf-builder`，按 `Ctrl+Shift+K` 把两个 commit 推上去。

命令行 push 不行（Schannel `SEC_E_NO_CREDENTIALS`），必须用 IDEA。

## 第二步：确认 topic

仓库 `https://github.com/zz19940402/pointPdf-builder` 的 topic **已有 `dsh-plugin`**（我查过 API），不用再加。

## 第三步：等仓库满 24 小时

`created_at: 2026-11-24T17:31:09Z` = 北京时间 **2026-11-25 01:31**。

到 **2026-11-26 01:31 之后**才能提 PR（awesome CI 自动检查）。

## 第四步：提 PR 到 awesome-dsh-plugin

Fork https://github.com/awesome-dsh-plugin/awesome-dsh-plugin → 新建文件：

```
data/plugins/zz19940402__pointPdf-builder.yml
```

内容（复制本地 `SUBMISSION.yml`）：

```yaml
url: https://github.com/zz19940402/pointPdf-builder
name: zz19940402/pointPdf-builder
category: skill
description:
  en: 'DSH skill that renders a JSON resume into a standalone print-ready HTML file using five bundled A4 templates, with inlined CSS and no editor UI; the user prints to PDF from the browser.'
  zh: 'DSH 简历技能：把 JSON 简历数据用内置的 5 套 A4 模板渲染成独立可打印的 HTML（CSS 内联、无编辑界面），浏览器打印即可存为 PDF。'
```

## 合并后

dshmarket 自动收录，用户可 `dsh plugin add github:zz19940402/pointPdf-builder` 安装。

---

## 一句实话

这个 skill 的价值依赖 agent 会填 JSON 数据。描述里说的"JSON → HTML"完全属实（脚本已验证），但"做得好不好看"取决于 agent 填的数据质量——这不算虚假宣传，评审核对代码时看得出来。

构建脚本用的是项目自己的 render.js（vm 上下文），所以静态输出和实时预览完全一致，没有另起一套渲染逻辑。
