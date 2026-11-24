#!/usr/bin/env node
/**
 * build-resume.mjs — render a pointPdf-builder template into a standalone,
 * print-ready HTML file from a JSON data object.
 *
 * Usage:
 *   node build-resume.mjs --data resume.json --template tpl13 --out resume.html
 *
 * The renderer files are the project's own browser scripts. We evaluate them
 * in a minimal `vm` context so the exact same rendering code that powers the
 * live preview produces the static output — no duplicate rendering logic.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const TEMPLATES = path.join(ROOT, 'templates')

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  const value = process.argv[i + 1]
  if (!value || value.startsWith('--')) throw new Error(`--${name} needs a value`)
  return value
}

function loadIntoContext(ctx, file) {
  const code = fs.readFileSync(file, 'utf8')
  vm.runInNewContext(code, ctx, { filename: file })
}

function build(data, template, outPath) {
  const dir = path.join(TEMPLATES, template)
  const htmlPath = path.join(dir, 'index.html')
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`unknown template "${template}" (no ${htmlPath})`)
  }

  // A browser-ish global object the project's IIFEs can attach to.
  const sandbox = { console }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  const ctx = vm.createContext(sandbox)

  // shared/common.js defines esc/lines/dr/contacts/verifyBox as globals.
  loadIntoContext(ctx, path.join(TEMPLATES, 'shared', 'common.js'))
  // The template's render.js defines window.Render = { render, esc }.
  const renderFile = template === 'tpl13' ? 'render.js' : `${template}.render.js`
  loadIntoContext(ctx, path.join(dir, renderFile))

  if (!ctx.Render || typeof ctx.Render.render !== 'function') {
    throw new Error(`template "${template}" did not expose Render.render()`)
  }
  const rendered = ctx.Render.render(data)

  let html = fs.readFileSync(htmlPath, 'utf8')

  // Inline the two stylesheets so the output is a single portable file.
  const inlineCss = (file) => fs.readFileSync(path.join(dir, file), 'utf8')
  const cssName = template === 'tpl13' ? 'resume.css' : `${template}.css`
  const commonCss = fs.readFileSync(path.join(TEMPLATES, 'shared', 'common.css'), 'utf8')
  const tplCss = inlineCss(cssName)

  html = html.replace(
    /<link rel="stylesheet" href="\.\.\/shared\/common\.css"\/>/,
    `<style>${commonCss}</style>`,
  )
  html = html.replace(
    new RegExp(`<link rel="stylesheet" href="${cssName}"\\/>`),
    `<style>${tplCss}</style>`,
  )

  // Fill the preview container with the rendered resume.
  html = html.replace('<div id="preview"></div>', `<div id="preview">${rendered}</div>`)

  // Strip the editor UI and all scripts from the static output; keep the page
  // as a clean A4 resume that prints with Ctrl+P.
  html = html.replace(/<div class="toolbar[\s\S]*?<\/div>\s*(?=<div class="layout">)/, '')
  // The form panel contains nested divs, so cut by the known boundaries:
  // from its opening tag up to the preview panel that follows it.
  html = html.replace(/<div class="form-panel[^>]*>[\s\S]*?(?=<div class="preview-panel">)/, '')
  html = html.replace(/<script[\s\S]*?<\/script>/g, '')

  // Static-output tweaks: no editor layout, no screen shadow on paper.
  html = html.replace(
    '</head>',
    `<style>body{background:#fff}.layout{display:block;padding:0}.preview-panel{width:100%}.resume-page{box-shadow:none;margin:0}</style></head>`,
  )

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, html, 'utf8')
  return outPath
}

function main() {
  const dataPath = arg('data')
  const template = arg('template', 'tpl13')
  const outPath = arg('out')
  if (!dataPath || !outPath) {
    console.error('usage: node build-resume.mjs --data <resume.json> --template <tplN> --out <file.html>')
    process.exit(2)
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  try {
    const file = build(data, template, outPath)
    console.log(`OK: ${file}`)
  } catch (err) {
    console.error(`ERROR: ${err.message}`)
    process.exit(1)
  }
}

main()
