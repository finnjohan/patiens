// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3

Page {
    id: page

    header: PageHeader { id: header; title: root.tr("How to play") }

    Flickable {
        anchors { top: header.bottom; left: parent.left; right: parent.right; bottom: parent.bottom }
        contentHeight: content.height + units.gu(4)
        clip: true

        Column {
            id: content
            anchors { left: parent.left; right: parent.right; top: parent.top; margins: units.gu(2) }
            spacing: units.gu(1.6)

            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("The goal is to move all 52 cards to the four foundations, from ace to king in each suit.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Tap a card to select it, then tap the pile where it should go. Tap the selected card again to send it straight to a foundation.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("In the tableau the cards are built downwards in alternating colours. An empty pile only accepts a king.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Tap the stock to turn cards. When it is empty, tap it again to turn the waste pile back.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Every move can be undone, and the game is saved automatically when you leave the app.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                textSize: Label.Small
                color: theme.palette.normal.backgroundSecondaryText
                text: root.tr("Cards from the waste give 5 points to the tableau and 10 to the foundations. Turning a card gives 5, and moving a card back from a foundation costs 15.")
            }
        }
    }
}
