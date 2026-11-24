# pointPdf-builder

## DSH skill bundle

This repository is also a DeepSeek Harness skill bundle (`pointpdf-dsh`). Install it with:

```sh
dsh plugin --profile <name> add github:zz19940402/pointPdf-builder
```

Then ask the agent for a resume and it will use the bundled `pointpdf` skill and the `templates/` snapshot to render a standalone HTML resume from JSON. See [skills/pointpdf/SKILL.md](skills/pointpdf/SKILL.md) for the data contract and templates. The five live templates under `tpl0/` ... `tpl13/` and `shared/` are the original editable project; `templates/` is the bundle's frozen copy used by the skill's build script.

---
一个**纯静态**的中文简历（PDF）生成器：左侧表单编辑、右侧 A4 实时预览、浏览器打印输出 PDF。无框架、无构建步骤、无后端、零依赖。

## 特性

- **5 套模板**：tpl0 单栏极简 / tpl1 灰白单栏 / tpl4 深色侧栏 / tpl11 横幅分区 / tpl13 青绿侧栏
- **实时预览**：表单输入即时渲染到 A4 纸面（rAF 合帧，中文输入法不掉字）
- **本地保存**：数据存 `localStorage`，防抖 + 脏检查写入
- **JSON 导入导出**：简历数据可备份、可迁移
- **打印保真**：`print-color-adjust: exact` 通配，深色侧栏打印不丢底色
- **学信网验证标识**：可选填验证号与链接，生成可核对的验证区块

## 快速开始

无需安装任何东西：

```bash
# 方式一：直接双击任意模板的 index.html
# 方式二：起一个静态服务（推荐，localStorage 按源隔离）
npx serve .
# 或
python -m http.server 8080
```

然后浏览器打开 `tpl0/index.html` … `tpl13/index.html` 任选模板，填完点「打印 / 存为 PDF」即可。

## 数据协议

所有字段可选，段落均为数组；`skills[].items` 是唯一的数组字段（表单里以逗号分隔编辑）：

```js
{
  basic:    { name, phone, email, city, avatar, title, age, gender },
  intent:   { target, expectedSalary },
  education:[{ school, major, degree, start, end, desc }],
  work:     [{ company, title, start, end, desc }],
  projects: [{ name, role, link, desc }],
  skills:   [{ category, items: [] }],
  certs:    [{ name, date }],
  summary:  '',
  verify:   { chsiCode, chsiUrl, chsiName, chsiSchool, chsiDegree, enabled }
}
```

## 目录结构

```
tplN/index.html        模板入口（编辑表单 + 预览容器）
tplN/tplN.css          简历纸样式（tpl13 为 resume.css，历史遗留）
tplN/tplN.render.js    state → HTML 渲染器（tpl13 为 render.js）
shared/common.css      编辑区样式（变量化，5 模板共用）
shared/common.js       渲染工具 + toast/confirmBox
shared/data.js         数据层（localStorage，预留后端桥）
shared/app.js          控制器（表单 ↔ state ↔ 预览）
```

## 已知限制

- 无后端；数据仅存本地浏览器，清浏览器数据 = 丢简历（请用 JSON 导出备份）
- 内容超过一页时，第二页顶部贴边（`@page margin:0` 方案的已知取舍）
- 「学历已验证」标识为**自声明字段**：项目无法官方核验学信网数据，请如实填写，伪造学历信息需自担后果

## 开发

新增模板建议按 `tplN.*` 命名（tpl13 的 `resume.css`/`render.js` 是历史特例）。

## License

[MIT](LICENSE)
