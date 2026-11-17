// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Kör: node tests/i18n.test.js – alla texter som används ska finnas på svenska.
const fs = require("fs"), path = require("path")
const ctx = require("./load.js")(["I18n.js"])
const used = new Set()
for (const f of fs.readdirSync(path.join(__dirname, "../qml")).filter(f => f.endsWith(".qml"))) {
    const src = fs.readFileSync(path.join(__dirname, "../qml", f), "utf8")
    for (const m of src.matchAll(/root\.tr\("((?:[^"\\]|\\.)*)"\)/g)) used.add(m[1])
}
let fail = 0
for (const k of used) if (ctx.sv[k] === undefined) { fail++; console.log("saknas på svenska:", k) }
console.log(`${used.size} texter, ${fail} saknas`)
process.exit(fail ? 1 : 0)
