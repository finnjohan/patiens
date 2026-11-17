// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Kör: node tests/logic.test.js
const L = require("./load.js")(["Logic.js"])
let fails = 0, checks = 0

function ok(cond, what) {
    checks++
    if (!cond) { fails++; console.log("FEL:", what) }
}
function eq(a, b, what) {
    checks++
    const same = JSON.stringify(a) === JSON.stringify(b)
    if (!same) { fails++; console.log("FEL:", what, "\n  fick:", JSON.stringify(a), "\n  väntade:", JSON.stringify(b)) }
}
const c = (s, r, up) => ({ s, r, up: up !== false })

// ---- Kortlek och giv ------------------------------------------------------
const g = L.newGame(42, 1)
ok(g.stock.length === 24, "24 kort i högen, fick " + g.stock.length)
eq(g.tableau.map(p => p.length), [1, 2, 3, 4, 5, 6, 7], "högarnas storlek")
ok(g.tableau.every(p => p[p.length - 1].up), "översta kortet i varje hög är vänt upp")
ok(g.tableau.every(p => p.slice(0, -1).every(k => !k.up)), "övriga kort i borden är vända ned")
const all = [].concat(...g.tableau, g.stock)
ok(all.length === 52, "52 kort totalt")
ok(new Set(all.map(k => k.s + ":" + k.r)).size === 52, "alla kort unika")
eq(L.serialize(L.newGame(42, 1)), L.serialize(L.newGame(42, 1)), "samma seed ger samma giv")
ok(L.serialize(L.newGame(42, 1)) !== L.serialize(L.newGame(43, 1)), "olika seed ger olika giv")
ok(g.foundations.length === 4 && g.foundations.every(f => f.length === 0), "tomma fundament")

// ---- Regler ---------------------------------------------------------------
ok(L.canPlaceOnTableau(c(0, 7), [c(1, 8)]), "röd 7 på svart 8")
ok(!L.canPlaceOnTableau(c(0, 7), [c(3, 8)]), "svart 7 på svart 8 nekas")
ok(!L.canPlaceOnTableau(c(2, 7), [c(1, 8)]), "röd 7 på röd 8 nekas")
ok(L.canPlaceOnTableau(c(0, 13), []), "kung på tom plats")
ok(!L.canPlaceOnTableau(c(0, 12), []), "dam på tom plats nekas")
ok(L.canPlaceOnFoundation(c(2, 1), []), "ess på tomt fundament")
ok(!L.canPlaceOnFoundation(c(2, 2), []), "tvåa på tomt fundament nekas")
ok(L.canPlaceOnFoundation(c(2, 2), [c(2, 1)]), "tvåa på ess i samma färg")
ok(!L.canPlaceOnFoundation(c(0, 2), [c(2, 1)]), "tvåa i annan färg nekas")

// ---- Drag och poäng -------------------------------------------------------
function emptyState() {
    const st = L.newGame(7, 1)
    st.tableau = [[], [], [], [], [], [], []]
    st.stock = []; st.waste = []; st.score = 0; st.moves = 0; st.history = []
    st.foundations = [[], [], [], []]
    return st
}
let st = emptyState()
st.tableau[0] = [c(1, 7, true), c(2, 1, true)]
ok(L.applyMove(st, { area: "tableau", pile: 0, index: 1 }, { area: "foundation", pile: 0 }), "ess till fundament")
eq(st.foundations[0].length, 1, "fundamentet fick esset")
eq(st.tableau[0].length, 1, "sjuan är kvar i borden")
ok(st.score === 10, "10 poäng för ess till fundament, fick " + st.score)

// flytta en följd 7♥ på 8♠
st = emptyState()
st.tableau[0] = [c(1, 7, true), c(0, 6, true)]   // 7♥ 6♠
st.tableau[1] = [c(3, 8, true)]                  // 8♣
ok(L.applyMove(st, { area: "tableau", pile: 0, index: 0 }, { area: "tableau", pile: 1 }), "flytta 7♥6♠ till 8♣")
eq(st.tableau[1].length, 3, "tre kort i målet")
eq(st.tableau[0].length, 0, "källan tom")
ok(!L.canMove(st, { area: "tableau", pile: 1, index: 0 }, { area: "tableau", pile: 1 }), "kan inte flytta till sig själv")

// fel färg nekas
st = emptyState()
st.tableau[0] = [c(1, 7, true)]
st.tableau[1] = [c(2, 8, true)]
ok(!L.canMove(st, { area: "tableau", pile: 0, index: 0 }, { area: "tableau", pile: 1 }), "röd på röd nekas")

// vända kort ger poäng och synligt kort
st = emptyState()
st.tableau[0] = [c(3, 9, false), c(1, 7, true)]
st.tableau[1] = [c(0, 8, true)]
L.applyMove(st, { area: "tableau", pile: 0, index: 1 }, { area: "tableau", pile: 1 })
ok(st.tableau[0][0].up, "kortet under vänds upp")
ok(st.score >= 5, "poäng för uppvänt kort")

// ---- Högen och kasten -----------------------------------------------------
st = emptyState()
st.stock = [c(0, 2), c(0, 3), c(0, 4)]   // sista = överst
L.draw(st)
eq(st.waste.length, 1, "drag 1 ger ett kort i kasten")
ok(st.waste[0].up && st.waste[0].r === 4, "översta kortet drogs och vändes upp")
eq(st.stock.length, 2, "två kvar i högen")

st = emptyState()
st.drawCount = 3
st.stock = [c(0, 1), c(0, 2), c(0, 3), c(0, 4), c(0, 5)]
L.draw(st)
eq(st.waste.map(k => k.r), [5, 4, 3], "drag 3 tar tre kort i rätt ordning")
eq(st.stock.length, 2, "två kvar efter drag 3")

st = emptyState()
st.drawCount = 1
st.stock = []
st.waste = [c(0, 5, true), c(0, 6, true), c(0, 7, true)]
ok(L.canRecycle(st), "kan vända tillbaka kasten")
ok(L.recycle(st), "vänd tillbaka")
eq(st.stock.length, 3, "alla kort tillbaka i högen")
eq(st.waste.length, 0, "kasten tom")
eq(st.stock.map(k => k.r), [7, 6, 5], "ordningen vänds vid omvändning")
ok(st.stock.every(k => !k.up), "korten vänds ned igen")
eq(st.score, -100, "poängavdrag vid omvändning (drag 1)")

// tapStock gör rätt sak
st = emptyState()
st.stock = [c(0, 9)]
eq(L.tapStock(st), "draw", "tapStock drar")
eq(L.tapStock(st), "recycle", "tapStock vänder tillbaka när högen är tom")

// ---- Ångra ----------------------------------------------------------------
st = emptyState()
st.tableau[0] = [c(2, 1, true)]
st.tableau[1] = [c(0, 13, true)]
L.applyMove(st, { area: "tableau", pile: 0, index: 0 }, { area: "foundation", pile: 0 })
ok(L.undo(st), "ångra fungerar")
eq(st.foundations[0].length, 0, "fundamentet tomt igen")
eq(st.tableau[0].length, 1, "kortet tillbaka i borden")
eq(st.score, 0, "poängen återställd")
ok(!L.undo(st), "inget att ångra")

// ---- Ledtråd --------------------------------------------------------------
st = emptyState()
st.tableau[0] = [c(2, 1, true)]
st.tableau[1] = [c(0, 13, true)]
const h = L.findHint(st)
eq(h.kind, "foundation", "ledtråd hittar ess till fundament")
eq(h.from.pile, 0, "ledtråden pekar på rätt hög")

// ---- Automatisk avslutning och vinst --------------------------------------
st = emptyState()
st.tableau[0] = [c(2, 12, true), c(2, 13, true)]
st.tableau[1] = [c(2, 1, true)]
st.stock = []; st.waste = []
ok(L.canAutoFinish(st), "kan spela klart när allt är vänt och högen är tom")
st.stock = [c(0, 5)]
ok(!L.canAutoFinish(st), "kan inte spela klart med kort kvar i högen")

st = emptyState()
for (let f = 0; f < 4; f++) for (let r = 1; r <= 13; r++) st.foundations[f].push(c(f, r, true))
ok(L.isWon(st), "alla fyra fundament fulla = vinst")
st.foundations[3].pop()
ok(!L.isWon(st), "ofullständigt fundament = inte vinst")

// vinst upptäcks vid sista draget
st = emptyState()
for (let f = 0; f < 4; f++) for (let r = 1; r <= (f === 0 ? 12 : 13); r++) st.foundations[f].push(c(f, r, true))
st.tableau[0] = [c(0, 13, true)]
L.applyMove(st, { area: "tableau", pile: 0, index: 0 }, { area: "foundation", pile: 0 })
ok(st.won, "sista kortet ger vinst")

// ---- Spara och läs tillbaka ----------------------------------------------
st = L.newGame(1234, 3)
L.draw(st)
const round = L.deserialize(L.serialize(st))
ok(round !== null, "sparat spel kan läsas tillbaka")
eq(L.serialize(round), L.serialize(st), "runt-varv bevarar spelet")
eq(L.deserialize("{}"), null, "skräp ger null")
eq(L.deserialize("inte json"), null, "ogiltig json ger null")

// ---- Ledtrådarna spelar klart en nästan färdig giv ------------------------
st = emptyState()
for (let f = 0; f < 4; f++) for (let r = 1; r <= 12; r++) st.foundations[f].push(c(f, r, true))
st.tableau[0] = [c(0, 13, true)]
st.tableau[1] = [c(1, 13, true)]
st.tableau[2] = [c(2, 13, true)]
st.tableau[3] = [c(3, 13, true)]
let guard = 0
while (!st.won && guard++ < 40) {
    const hint = L.findHint(st)
    ok(hint !== null && hint.kind === "foundation", "ledtråd " + guard + " pekar på fundament")
    if (!hint || hint.kind !== "foundation") break
    if (!L.applyMove(st, hint.from, hint.to)) break
}
ok(st.won, "givet går att spela klart med ledtrådarna")
ok(guard === 4, "fyra drag räckte, tog " + guard)

// ---- Ny giv ger alltid en ledtråd ----------------------------------------
st = L.newGame(99, 1)
const first = L.findHint(st)
ok(first !== null, "ny giv har alltid något att göra")
ok(first.kind === "foundation" || first.kind === "tableau" || first.kind === "draw", "ledtråden har en typ")

console.log(`\n${checks} kontroller, ${fails} fel`)
process.exit(fails ? 1 : 0)
