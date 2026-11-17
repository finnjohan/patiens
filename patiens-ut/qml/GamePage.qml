// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import Lomiri.Components.Popups 1.3
import "Logic.js" as Logic
import "Storage.js" as Storage

Page {
    id: page

    property var game: null
    property var sel: null
    property var hintMove: null

    // Visningskopior som QML kan binda mot
    property var stock: []
    property var waste: []
    property var foundations: [[], [], [], []]
    property var tableau: [[], [], [], [], [], [], []]
    property int score: 0
    property int moves: 0
    property int elapsed: 0
    property bool won: false
    property bool canUndo: false
    property bool canFinish: false
    property string statusText: ""

    readonly property real margin: Math.max(units.dp(6), width * 0.008)
    readonly property real cardGap: Math.max(units.dp(4), width * 0.008)
    readonly property real colW: Math.floor((width - 2 * margin - 6 * cardGap) / 7)
    readonly property real cardH: Math.floor(colW * 1.42)
    readonly property real topY: units.gu(3.4) + margin * 2
    readonly property real tabY: topY + cardH + cardGap * 2
    readonly property real tabH: Math.max(cardH * 2, felt.height - tabY - units.gu(3))

    readonly property string statsText: root.tr("Time") + " " + fmtTime(elapsed)
        + "  ·  " + root.tr("Moves") + " " + moves
        + "  ·  " + root.tr("Score") + " " + score

    header: PageHeader {
        id: header
        title: root.tr("Patiens")

        trailingActionBar.actions: [
            Action {
                iconName: "edit-undo"
                text: root.tr("Undo")
                enabled: page.canUndo
                onTriggered: page.doUndo()
            },
            Action {
                iconName: "help"
                text: root.tr("Hint")
                onTriggered: page.showHint()
            },
            Action {
                iconName: "media-playback-start"
                text: root.tr("Play out")
                enabled: page.canFinish
                onTriggered: page.finishGame()
            },
            Action {
                iconName: "add"
                text: root.tr("New game")
                onTriggered: PopupUtils.open(newGameDialog, page)
            },
            Action {
                iconName: "settings"
                text: root.tr("Settings")
                onTriggered: stack.push(Qt.resolvedUrl("SettingsPage.qml"))
            }
        ]
    }

    // ---- Spelbordet -------------------------------------------------------

    Rectangle {
        id: felt
        anchors { top: header.bottom; left: parent.left; right: parent.right; bottom: parent.bottom }
        gradient: Gradient {
            GradientStop { position: 0.0; color: root.isDark ? "#0e4a32" : "#136945" }
            GradientStop { position: 1.0; color: root.isDark ? "#07271a" : "#0a3f28" }
        }

        Rectangle {
            id: statsBar
            anchors { top: parent.top; left: parent.left; right: parent.right }
            height: units.gu(3.4)
            color: "#00000026"

            Label {
                anchors.centerIn: parent
                width: parent.width - units.gu(2)
                horizontalAlignment: Text.AlignHCenter
                elide: Text.ElideRight
                color: "#e8f5ec"
                textSize: Label.Small
                text: page.statusText !== "" ? page.statusText : page.statsText
            }
        }

        // ---- Högen (stock) ----
        Item {
            id: stockSlot
            x: page.margin
            y: page.topY
            width: page.colW
            height: page.cardH

            Rectangle {
                anchors.fill: parent
                radius: page.colW * 0.09
                color: "#ffffff12"
                border.color: "#ffffff33"
                border.width: 1
            }

            Card {
                visible: page.stock.length > 1
                x: units.dp(2); y: units.dp(2)
                width: parent.width; height: parent.height
                faceUp: false
                z: 0
            }
            Card {
                visible: page.stock.length > 0
                width: parent.width; height: parent.height
                faceUp: false
                z: 1
            }
            Label {
                anchors.centerIn: parent
                visible: page.stock.length > 0
                text: page.stock.length
                color: "#ffffffdd"
                font.pixelSize: units.gu(2)
                z: 2
            }
            Icon {
                anchors.centerIn: parent
                visible: page.stock.length === 0
                name: "view-refresh"
                width: units.gu(3)
                height: width
                color: "#ffffff99"
            }
            MouseArea {
                anchors.fill: parent
                onClicked: page.tapStock()
            }
        }

        // ---- Kasten (waste) ----
        Item {
            id: wasteSlot
            x: page.margin + page.colW + page.cardGap
            y: page.topY
            width: page.colW * 1.55
            height: page.cardH

            Rectangle {
                width: page.colW
                height: page.cardH
                radius: page.colW * 0.09
                color: "#ffffff0e"
                border.color: "#ffffff2a"
                border.width: 1
            }

            Repeater {
                model: page.wasteFan()
                delegate: Card {
                    width: page.colW
                    height: page.cardH
                    x: index * page.colW * 0.24
                    rank: modelData.r
                    suit: modelData.s
                    faceUp: true
                    z: index
                }
            }

            MouseArea {
                anchors.fill: parent
                onClicked: page.tapWaste()
            }
        }

        // ---- Fundamenten ----
        Repeater {
            model: 4
            delegate: Item {
                id: foundationSlot
                property int fIndex: index
                x: page.margin + (3 + index) * (page.colW + page.cardGap)
                y: page.topY
                width: page.colW
                height: page.cardH

                Rectangle {
                    anchors.fill: parent
                    radius: page.colW * 0.09
                    color: "#ffffff10"
                    border.color: page.isHintTarget("foundation", foundationSlot.fIndex) ? "#5fd18a" : "#ffffff30"
                    border.width: page.isHintTarget("foundation", foundationSlot.fIndex) ? 3 : 1
                }

                Text {
                    anchors.centerIn: parent
                    visible: page.foundations[foundationSlot.fIndex].length === 0
                    text: ["\u2660", "\u2665", "\u2666", "\u2663"][foundationSlot.fIndex]
                    color: "#ffffff33"
                    font.pixelSize: page.cardH * 0.34
                }

                Repeater {
                    model: page.foundations[foundationSlot.fIndex]
                    delegate: Card {
                        width: page.colW
                        height: page.cardH
                        rank: modelData.r
                        suit: modelData.s
                        faceUp: true
                        z: index
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    onClicked: page.tapFoundation(foundationSlot.fIndex)
                }
            }
        }

        // ---- Borden (tableau) ----
        Repeater {
            model: 7
            delegate: Item {
                id: tableauCol
                property int pileIndex: index
                x: page.margin + index * (page.colW + page.cardGap)
                y: page.tabY
                width: page.colW
                height: page.tabH

                Rectangle {
                    anchors.fill: parent
                    visible: page.tableau[tableauCol.pileIndex].length === 0
                    radius: page.colW * 0.09
                    color: "#ffffff10"
                    border.color: page.isHintTarget("tableau", tableauCol.pileIndex) ? "#5fd18a" : "#ffffff30"
                    border.width: page.isHintTarget("tableau", tableauCol.pileIndex) ? 3 : 1

                    Text {
                        anchors.centerIn: parent
                        text: "K"
                        color: "#ffffff26"
                        font.pixelSize: page.cardH * 0.3
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    enabled: page.tableau[tableauCol.pileIndex].length === 0
                    onClicked: page.tapTableauSlot(tableauCol.pileIndex)
                }

                Repeater {
                    model: page.tableau[tableauCol.pileIndex]
                    delegate: Card {
                        width: page.colW
                        height: page.cardH
                        y: page.pileOffsets(tableauCol.pileIndex)[index]
                        rank: modelData.r
                        suit: modelData.s
                        faceUp: modelData.up
                        selected: page.isSelected("tableau", tableauCol.pileIndex, index)
                        hinted: page.isHintSource("tableau", tableauCol.pileIndex, index)
                        z: index

                        MouseArea {
                            anchors.fill: parent
                            onClicked: page.tapCard("tableau", tableauCol.pileIndex, index)
                        }
                    }
                }
            }
        }
    }

    // ---- Vinst ------------------------------------------------------------

    Rectangle {
        id: winOverlay
        anchors.fill: parent
        visible: page.won
        color: "#000000bb"
        z: 100

        Column {
            anchors.centerIn: parent
            width: parent.width * 0.82
            spacing: units.gu(1.2)

            Label {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                text: root.tr("Congratulations!")
                color: "white"
                fontSize: "x-large"
            }
            Label {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                text: root.tr("You cleared the solitaire.")
                color: "#dfeee4"
            }
            Label {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.WordWrap
                text: root.tr("Time: %1 · Moves: %2 · Score: %3")
                          .arg(page.fmtTime(page.elapsed)).arg(page.moves).arg(page.score)
                color: "#dfeee4"
            }
            Item { width: 1; height: units.gu(1) }
            Button {
                anchors.horizontalCenter: parent.horizontalCenter
                text: root.tr("Play again")
                onClicked: page.startNewGame()
            }
            Button {
                anchors.horizontalCenter: parent.horizontalCenter
                text: root.tr("Same deal")
                color: theme.palette.normal.base
                onClicked: page.restartDeal()
            }
        }
    }

    // ---- Timers -----------------------------------------------------------

    Timer {
        id: clock
        interval: 1000
        repeat: true
        running: page.game !== null && !page.won
        onTriggered: {
            page.elapsed++
            if (page.elapsed % 10 === 0) page.save()
        }
    }

    Timer {
        id: hintTimer
        interval: 4000
        onTriggered: {
            page.hintMove = null
            page.statusText = ""
        }
    }

    Timer {
        id: autoTimer
        interval: 150
        repeat: true
        onTriggered: {
            var h = Logic.firstFoundationMove(page.game)
            if (!h || !Logic.applyMove(page.game, h.from, h.to)) {
                autoTimer.stop()
                return
            }
            page.sync()
            page.save()
        }
    }

    // ---- Funktioner -------------------------------------------------------

    function fmtTime(sec) {
        var m = Math.floor(sec / 60)
        var s = sec % 60
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s
    }

    function sync() {
        stock = game.stock.slice()
        waste = game.waste.slice()
        foundations = game.foundations.map(function (p) { return p.slice() })
        tableau = game.tableau.map(function (p) { return p.slice() })
        score = game.score
        moves = game.moves
        canUndo = game.history.length > 0
        canFinish = Logic.canAutoFinish(game)
        won = game.won
    }

    function save() {
        if (!game) return
        game.elapsed = elapsed
        Storage.setSetting("savedGame", Logic.serialize(game))
    }

    function startNewGame() {
        var seed = root.dealParam > 0 ? root.dealParam : Math.floor(Math.random() * 2000000000)
        game = Logic.newGame(seed, root.drawCount)
        sel = null
        hintMove = null
        statusText = ""
        elapsed = 0
        autoTimer.stop()
        sync()
        save()
    }

    function restartDeal() {
        if (!game) return
        game = Logic.newGame(game.seed, game.drawCount)
        sel = null
        hintMove = null
        statusText = ""
        elapsed = 0
        autoTimer.stop()
        sync()
        save()
    }

    function cardAt(area, pile, index) {
        if (area === "waste") return waste.length ? waste[waste.length - 1] : null
        if (area === "foundation") return Logic.topOf(game.foundations[pile])
        if (area === "tableau") return game.tableau[pile][index] || null
        return null
    }

    function wasteFan() {
        var n = Math.min(3, waste.length)
        var out = []
        for (var i = waste.length - n; i < waste.length; i++) out.push(waste[i])
        return out
    }

    function isSelected(area, pile, index) {
        if (sel === null) return false
        if (area !== "tableau") return sel.area === area && sel.pile === pile
        return sel.area === "tableau" && sel.pile === pile && index >= sel.index
    }

    function isHintSource(area, pile, index) {
        if (hintMove === null || !hintMove.from) return false
        return hintMove.from.area === area && hintMove.from.pile === pile && hintMove.from.index === index
    }

    function isHintTarget(area, pile) {
        if (hintMove === null || !hintMove.to) return false
        return hintMove.to.area === area && hintMove.to.pile === pile
    }

    function pileOffsets(pileIndex) {
        var pile = tableau[pileIndex]
        var upStep = cardH * 0.28
        var downStep = cardH * 0.155
        var ups = 0, downs = 0
        for (var i = 0; i < pile.length; i++) {
            if (pile[i].up) ups++
            else downs++
        }
        var maxY = tabH - cardH
        var total = ups * upStep + downs * downStep
        if (total > maxY && total > 0) {
            var k = maxY / total
            upStep *= k
            downStep *= k
        }
        var out = []
        var y = 0
        for (var j = 0; j < pile.length; j++) {
            out.push(y)
            y += pile[j].up ? upStep : downStep
        }
        return out
    }

    function clearSelection() {
        sel = null
    }

    function tryMove(from, to) {
        if (!game || won) return false
        if (!Logic.canMove(game, from, to)) return false
        Logic.applyMove(game, from, to)
        sel = null
        hintMove = null
        statusText = ""
        hintTimer.stop()
        sync()
        save()
        return true
    }

    function tryFoundation(from) {
        var card = cardAt(from.area, from.pile, from.index)
        if (!card) return false
        var f = Logic.foundationFor(game, card)
        if (f < 0) return false
        return tryMove(from, { area: "foundation", pile: f })
    }

    function tapStock() {
        if (!game || won) return
        if (Logic.tapStock(game)) {
            sel = null
            hintMove = null
            statusText = ""
            sync()
            save()
        }
    }

    function tapWaste() {
        if (!game || won) return
        if (!waste.length) {
            sel = null
            return
        }
        tapCard("waste", 0, waste.length - 1)
    }

    function tapCard(area, pile, index) {
        if (!game || won) return
        var card = cardAt(area, pile, index)
        if (!card || !card.up) return
        if (area === "waste") index = waste.length - 1

        if (sel !== null) {
            if (sel.area === area && sel.pile === pile && sel.index === index) {
                if (tryFoundation(sel)) return
                clearSelection()
                return
            }
            if (tryMove(sel, { area: area, pile: pile })) return
        }

        sel = { area: area, pile: pile, index: index }
        hintMove = null
        statusText = ""
    }

    function tapFoundation(f) {
        if (!game || won) return
        if (foundations[f].length > 0) {
            tapCard("foundation", f, foundations[f].length - 1)
            return
        }
        if (sel !== null && tryMove(sel, { area: "foundation", pile: f })) return
        clearSelection()
    }

    function tapTableauSlot(pile) {
        if (!game || won) return
        if (sel !== null && tryMove(sel, { area: "tableau", pile: pile })) return
        clearSelection()
    }

    function doUndo() {
        if (!game || !Logic.undo(game)) return
        sel = null
        hintMove = null
        statusText = ""
        hintTimer.stop()
        autoTimer.stop()
        sync()
        save()
    }

    function showHint() {
        if (!game || won) return
        hintMove = Logic.findHint(game)
        statusText = hintText(hintMove)
        hintTimer.restart()
    }

    function hintText(h) {
        if (!h) return root.tr("No hint right now.")
        if (h.kind === "draw") return root.tr("Turn a card from the stock.")
        var card = cardAt(h.from.area, h.from.pile, h.from.index)
        var label = card ? Logic.cardLabel(card) : "?"
        if (h.to.area === "foundation") return root.tr("Try moving %1 to the foundation.").arg(label)
        var target = game.tableau[h.to.pile]
        var targetLabel = target.length ? Logic.cardLabel(target[target.length - 1]) : root.tr("Empty")
        return root.tr("Try moving %1 to %2.").arg(label).arg(targetLabel)
    }

    function finishGame() {
        if (!game || won) return
        sel = null
        hintMove = null
        statusText = ""
        hintTimer.stop()
        autoTimer.start()
    }

    // ---- Start ------------------------------------------------------------

    Component {
        id: newGameDialog
        Dialog {
            id: dlg
            title: root.tr("Start a new game?")
            text: root.tr("The current game will be lost.")
            Button {
                text: root.tr("Start")
                color: theme.palette.normal.positive
                onClicked: {
                    PopupUtils.close(dlg)
                    page.startNewGame()
                }
            }
            Button {
                text: root.tr("Cancel")
                onClicked: PopupUtils.close(dlg)
            }
        }
    }

    Component.onCompleted: {
        var restored = null
        if (!root.fresh) {
            var text = Storage.setting("savedGame", "")
            if (text && text !== "") restored = Logic.deserialize(text)
        }
        if (restored) {
            game = restored
            elapsed = restored.elapsed || 0
            sync()
        } else {
            startNewGame()
        }
    }
}
