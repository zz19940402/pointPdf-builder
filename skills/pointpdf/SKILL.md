---
name: pointpdf
description: "Generate a print-ready HTML resume from a JSON data object using the bundled pointPdf-builder templates (tpl0 simple, tpl1 gray, tpl4 dark sidebar, tpl11 banner, tpl13 teal sidebar). Use when the user asks to build, generate, or export a resume/CV as HTML or PDF, or to fill in one of these resume templates."
metadata:
  version: "1.0.0"
  language: zh-CN
---

# PointPdf builder

Turn a JSON resume object into a standalone, print-ready HTML file. The output embeds the template CSS, contains no scripts or editor UI, and prints to PDF with Ctrl+P in a browser.

## When to use

- "帮我用青绿侧栏模板做一份简历"
- "把这份信息生成简历 PDF"
- "用 pointPdf-builder 导出 tpl4 版本"

## Data contract

Every field is optional; all sections are arrays. `skills[].items` must be an array.

```json
{
  "basic": { "name": "", "phone": "", "email": "", "city": "", "avatar": "", "title": "", "age": "", "gender": "" },
  "intent": { "target": "", "expectedSalary": "" },
  "education": [{ "school": "", "major": "", "degree": "", "start": "", "end": "", "desc": "" }],
  "work": [{ "company": "", "title": "", "start": "", "end": "", "desc": "" }],
  "projects": [{ "name": "", "role": "", "link": "", "desc": "" }],
  "skills": [{ "category": "", "items": [] }],
  "certs": [{ "name": "", "date": "" }],
  "summary": "",
  "verify": { "chsiCode": "", "chsiUrl": "", "chsiName": "", "chsiSchool": "", "chsiDegree": "", "enabled": false }
}
```

Build the JSON from what the user says. Do not invent facts (employers, dates, degrees, contact details) that were not provided; ask for anything essential that is missing, or leave the field empty.

## Available templates

| id | style |
|---|---|
| `tpl0` | minimal single column |
| `tpl1` | gray single column, three-column meta grid |
| `tpl4` | dark sidebar |
| `tpl11` | teal banner / sectioned |
| `tpl13` | teal left sidebar (the richest renderer) |

Default to `tpl13` when the user does not choose.

## Build

The skill bundle ships the templates and a Node build script. Resolve the bundled script path from this skill's **Base directory** (the skill tool result gives it, e.g. `<repo>/skills/pointpdf`). The script lives two levels up in `scripts/`.

```powershell
$script = Join-Path (Split-Path (Split-Path $skillDir -Parent) -Parent) 'scripts/build-resume.mjs'
node $script --data resume.json --template tpl13 --out resume.html
```

`--template` is optional and defaults to `tpl13`. A working example data file is `scripts/sample-resume.json` in the bundle.

The script uses the project's own renderers through a `vm` context, so the static HTML matches the live preview exactly. It inlines both stylesheets, fills the preview container, and strips scripts and the editor UI from the output.

## Output

Write the generated HTML into the user's working directory (or a path they name). Tell them:

- open it in a browser and press Ctrl+P, choose A4, margins 0, and enable background graphics for the sidebar/banner colors to print
- the "学历已验证" block is a self-declared field: the tool cannot verify CHSI data, so it must only be filled truthfully

## Limitations

- The output is HTML; PDF is produced by the browser's print dialog, not by this script.
- No backend: nothing is uploaded; all data stays in the local HTML file.
- The bundled templates are a snapshot. Changes to a project copy elsewhere are not reflected here.
