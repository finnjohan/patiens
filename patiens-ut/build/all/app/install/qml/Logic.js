.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Klondike-regler och spelstate. Ren JS utan Qt-beroenden, testas med node.

var SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"]
var SUIT_NAMES = ["spader", "hjärter", "ruter", "klöver"]
var RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function isRed(card) { return card.s === 1 || card.s === 2 }
function rankName(r) { return RANKS[r] }
function suitSymbol(s) { return SUITS[s] }
function cardLabel(card) { return SUITS[card.s] + RANKS[card.r] }

// ---- Kortlek och blandning ------------------------------------------------

function makeDeck() {
    var deck = []
    for (var s = 0; s < 4; s++) {
        for (var r = 1; r <= 13; r++) deck.push({ s: s, r: r, up: false })
    }
    return deck
}

// xorshift32 – samma giv med samma seed, oberoende av webbläsare/Qt
function makeRandom(seed) {
    var a = seed >>> 0
    if (a === 0) a = 0x9e3779b9
    return function () {
        a ^= a << 13; a >>>= 0
        a ^= a >>> 17
        a ^= a << 5; a >>>= 0
        return a / 4294967296
    }
}

function shuffledDeck(seed) {
    var deck = makeDeck()
    var rand = makeRandom(seed)
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1))
        var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp
    }
    return deck
}

// ---- Ny giv ---------------------------------------------------------------

function newGame(seed, drawCount) {
    var deck = shuffledDeck(seed)
    var st = {
        seed: seed,
        drawCount: drawCount === 3 ? 3 : 1,
        stock: [], waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        score: 0, moves: 0, redeals: 0, elapsed: 0,
        won: false, lastMove: null,
        history: []
    }
    // Radvis utdelning: rad k delas till högarna k..6, sista kortet i varje hög vänds upp.
    for (var k = 0; k < 7; k++) {
        for (var col = k; col < 7; col++) {
            var c = deck.pop()
            c.up = (col === k)
            st.tableau[col].push(c)
        }
    }
    while (deck.length > 0) {
        var rest = deck.pop()
        rest.up = false
        st.stock.push(rest)
    }
    return st
}

// ---- Kopior, historik och ångra -------------------------------------------

function copyCard(c) { return { s: c.s, r: c.r, up: c.up } }
function copyPile(p) { return p.map(copyCard) }

function snapshot(st) {
    return {
        stock: copyPile(st.stock),
        waste: copyPile(st.waste),
        foundations: st.foundations.map(copyPile),
        tableau: st.tableau.map(copyPile),
        score: st.score, moves: st.moves, redeals: st.redeals, won: st.won,
        lastMove: st.lastMove ? { from: st.lastMove.from, to: st.lastMove.to,
                                  s: st.lastMove.s, r: st.lastMove.r } : null
    }
}

function restore(st, snap) {
    st.stock = copyPile(snap.stock)
    st.waste = copyPile(snap.waste)
    st.foundations = snap.foundations.map(copyPile)
    st.tableau = snap.tableau.map(copyPile)
    st.score = snap.score
    st.moves = snap.moves
    st.redeals = snap.redeals
    st.won = snap.won
    st.lastMove = snap.lastMove || null
}

function pushHistory(st) {
    st.history.push(snapshot(st))
    if (st.history.length > 300) st.history.shift()
}

function canUndo(st) { return st.history.length > 0 }

function undo(st) {
    if (!st.history.length) return false
    restore(st, st.history.pop())
    return true
}

// ---- Regler ---------------------------------------------------------------

function topOf(pile) { return pile.length ? pile[pile.length - 1] : null }

function canPlaceOnTableau(card, pile) {
    if (!pile || pile.length === 0) return card.r === 13
    var top = pile[pile.length - 1]
    if (!top.up) return false
    return isRed(card) !== isRed(top) && card.r === top.r - 1
}

function canPlaceOnFoundation(card, pile) {
    if (!pile || pile.length === 0) return card.r === 1
    var top = pile[pile.length - 1]
    return top.s === card.s && card.r === top.r + 1
}

// Korten som får flyttas från en plats (en giltig följd i bordet).
function movableFrom(st, from) {
    if (!from) return []
    if (from.area === "waste") {
        if (!st.waste.length) return []
        return [st.waste[st.waste.length - 1]]
    }
    if (from.area === "foundation") {
        var f = st.foundations[from.pile]
        if (!f || !f.length) return []
        return [f[f.length - 1]]
    }
    if (from.area === "tableau") {
        var pile = st.tableau[from.pile]
        if (!pile || from.index < 0 || from.index >= pile.length) return []
        var out = []
        for (var i = from.index; i < pile.length; i++) {
            if (!pile[i].up) return []
            if (i > from.index) {
                var prev = pile[i - 1]
                if (!(isRed(pile[i]) !== isRed(prev) && pile[i].r === prev.r - 1)) return []
            }
            out.push(pile[i])
        }
        return out
    }
    return []
}

function canMove(st, from, to) {
    if (!to) return false
    var group = movableFrom(st, from)
    if (!group.length) return false
    if (to.area === "foundation") {
        if (group.length !== 1) return false
        if (from.area === "foundation" && to.pile === from.pile) return false
        return canPlaceOnFoundation(group[0], st.foundations[to.pile])
    }
    if (to.area === "tableau") {
        if (from.area === "tableau" && to.pile === from.pile) return false
        return canPlaceOnTableau(group[0], st.tableau[to.pile])
    }
    return false
}

function applyMove(st, from, to) {
    if (!canMove(st, from, to)) return false
    pushHistory(st)
    var group = movableFrom(st, from)

    if (from.area === "waste") st.waste.pop()
    else if (from.area === "foundation") st.foundations[from.pile].pop()
    else st.tableau[from.pile].splice(from.index, group.length)

    var dest = to.area === "foundation" ? st.foundations[to.pile] : st.tableau[to.pile]
    for (var i = 0; i < group.length; i++) dest.push(group[i])

    if (from.area === "waste") st.score += (to.area === "foundation" ? 10 : 5)
    else if (from.area === "foundation") st.score += (to.area === "tableau" ? -15 : 0)
    else if (to.area === "foundation") st.score += 10

    if (from.area === "tableau") {
        var rest = st.tableau[from.pile]
        if (rest.length && !rest[rest.length - 1].up) {
            rest[rest.length - 1].up = true
            st.score += 5
        }
    }

    st.moves++
    st.lastMove = { from: from, to: to, s: group[0].s, r: group[0].r }
    st.won = isWon(st)
    return true
}

// ---- Högen (stock) och kasten (waste) -------------------------------------

function canDraw(st) { return st.stock.length > 0 }
function canRecycle(st) { return st.stock.length === 0 && st.waste.length > 0 }

function draw(st) {
    if (!st.stock.length) return false
    pushHistory(st)
    var n = Math.min(st.drawCount, st.stock.length)
    for (var i = 0; i < n; i++) {
        var c = st.stock.pop()
        c.up = true
        st.waste.push(c)
    }
    st.moves++
    st.lastMove = null
    return true
}

function recycle(st) {
    if (!canRecycle(st)) return false
    pushHistory(st)
    var flipped = []
    for (var i = st.waste.length - 1; i >= 0; i--) flipped.push({ s: st.waste[i].s, r: st.waste[i].r, up: false })
    st.stock = flipped
    st.waste = []
    st.redeals++
    st.moves++
    st.lastMove = null
    st.score += (st.drawCount === 1 ? -100 : -20)
    return true
}

function tapStock(st) {
    if (canDraw(st)) return draw(st) ? "draw" : ""
    if (canRecycle(st)) return recycle(st) ? "recycle" : ""
    return ""
}

// ---- Ledtrådar och automatisk avslutning ---------------------------------

function foundationFor(st, card) {
    for (var f = 0; f < 4; f++) {
        if (canPlaceOnFoundation(card, st.foundations[f])) return f
    }
    return -1
}

function firstFoundationMove(st) {
    for (var i = 0; i < 7; i++) {
        var pile = st.tableau[i]
        if (!pile.length) continue
        var c = pile[pile.length - 1]
        if (!c.up) continue
        var f = foundationFor(st, c)
        if (f >= 0) return {
            from: { area: "tableau", pile: i, index: pile.length - 1 },
            to: { area: "foundation", pile: f },
            kind: "foundation"
        }
    }
    if (st.waste.length) {
        var w = st.waste[st.waste.length - 1]
        var fw = foundationFor(st, w)
        if (fw >= 0) return {
            from: { area: "waste", pile: 0, index: st.waste.length - 1 },
            to: { area: "foundation", pile: fw },
            kind: "foundation"
        }
    }
    return null
}

function reversesLastMove(st, from, to, card) {
    var lm = st.lastMove
    if (!lm || !card) return false
    if (lm.s !== card.s || lm.r !== card.r) return false
    return to.area === lm.from.area && to.pile === lm.from.pile
}

function findHint(st) {
    var f = firstFoundationMove(st)
    if (f) return f

    var best = null
    for (var i = 0; i < 7; i++) {
        var pile = st.tableau[i]
        for (var j = 0; j < pile.length; j++) {
            if (!pile[j].up) continue
            if (j === 0) continue                       // hela högen: bara om vi måste
            var group = movableFrom(st, { area: "tableau", pile: i, index: j })
            if (!group.length) continue
            for (var k = 0; k < 7; k++) {
                if (k === i) continue
                if (!canPlaceOnTableau(group[0], st.tableau[k])) continue
                if (reversesLastMove(st, { area: "tableau", pile: i }, { area: "tableau", pile: k }, group[0])) continue
                var exposes = !pile[j - 1].up
                var score = (exposes ? 10 : 0) + (st.tableau[k].length === 0 ? 2 : 0)
                if (!best || score > best.score) best = {
                    from: { area: "tableau", pile: i, index: j },
                    to: { area: "tableau", pile: k },
                    kind: "tableau", score: score
                }
            }
        }
    }
    if (best) return best

    if (st.waste.length) {
        var w = st.waste[st.waste.length - 1]
        for (var m = 0; m < 7; m++) {
            if (canPlaceOnTableau(w, st.tableau[m]) && !reversesLastMove(st, { area: "waste" }, { area: "tableau", pile: m }, w)) return {
                from: { area: "waste", pile: 0, index: st.waste.length - 1 },
                to: { area: "tableau", pile: m },
                kind: "tableau"
            }
        }
    }
    if (canDraw(st) || canRecycle(st)) return { kind: "draw" }
    return null
}

// Allt vänt upp och inget kvar i högen – då går spelet alltid att spela klart.
function canAutoFinish(st) {
    if (st.won) return false
    if (st.stock.length || st.waste.length) return false
    for (var i = 0; i < 7; i++) {
        var pile = st.tableau[i]
        for (var j = 0; j < pile.length; j++) if (!pile[j].up) return false
    }
    return true
}

function isWon(st) {
    for (var i = 0; i < 4; i++) if (st.foundations[i].length !== 13) return false
    return true
}

// ---- Spara och läs tillbaka ----------------------------------------------

function serialize(st) {
    return JSON.stringify({
        v: 1,
        seed: st.seed, drawCount: st.drawCount,
        stock: st.stock, waste: st.waste,
        foundations: st.foundations, tableau: st.tableau,
        score: st.score, moves: st.moves, redeals: st.redeals,
        elapsed: st.elapsed, won: st.won
    })
}

function deserialize(text) {
    try {
        var o = JSON.parse(text)
        if (!o || o.v !== 1) return null
        if (!o.tableau || o.tableau.length !== 7) return null
        if (!o.foundations || o.foundations.length !== 4) return null
        if (!o.stock || !o.waste) return null
        o.history = []
        o.drawCount = o.drawCount === 3 ? 3 : 1
        o.elapsed = o.elapsed || 0
        o.score = o.score || 0
        o.moves = o.moves || 0
        o.redeals = o.redeals || 0
        o.won = !!o.won
        return o
    } catch (e) {
        return null
    }
}
