// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "I18n.js" as I18n

Page {
    id: page

    readonly property var themeValues: ["auto", "light", "dark"]
    readonly property var langValues: ["auto"].concat(I18n.languages.map(function (l) { return l.code }))

    header: PageHeader { id: header; title: root.tr("Settings") }

    Flickable {
        anchors { top: header.bottom; left: parent.left; right: parent.right; bottom: parent.bottom }
        contentHeight: content.height + units.gu(4)
        clip: true

        Column {
            id: content
            anchors { left: parent.left; right: parent.right; top: parent.top; margins: units.gu(2) }
            spacing: units.gu(1.5)

            Label { text: root.tr("Game"); font.weight: Font.Medium }
            OptionSelector {
                width: parent.width
                expanded: true
                model: [root.tr("Draw 1 card"), root.tr("Draw 3 cards")]
                selectedIndex: root.drawCount === 3 ? 1 : 0
                onDelegateClicked: root.setDrawCount(index === 1 ? 3 : 1)
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                textSize: Label.Small
                color: theme.palette.normal.backgroundSecondaryText
                text: root.tr("How many cards are turned at a time from the stock.") + " "
                      + root.tr("Applies to the next deal.")
            }

            Item { width: 1; height: units.gu(1) }

            Label { text: root.tr("Theme"); font.weight: Font.Medium }
            OptionSelector {
                width: parent.width
                expanded: true
                model: [root.tr("Automatic"), root.tr("Light (day)"), root.tr("Dark (evening)")]
                selectedIndex: Math.max(0, page.themeValues.indexOf(root.themeSetting))
                onDelegateClicked: root.setTheme(page.themeValues[index])
            }

            Item { width: 1; height: units.gu(1) }

            Label { text: root.tr("Language"); font.weight: Font.Medium }
            OptionSelector {
                width: parent.width
                expanded: true
                model: [root.tr("Automatic (system language)")].concat(I18n.languages.map(function (l) { return l.name }))
                selectedIndex: Math.max(0, page.langValues.indexOf(root.langSetting))
                onDelegateClicked: root.setLanguage(page.langValues[index])
            }

            Item { width: 1; height: units.gu(1) }

            Label { text: root.tr("Rules"); font.weight: Font.Medium }
            Button {
                text: root.tr("How to play")
                onClicked: stack.push(Qt.resolvedUrl("HelpPage.qml"))
            }

            Item { width: 1; height: units.gu(1) }

            Label { text: root.tr("About"); font.weight: Font.Medium }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                color: theme.palette.normal.backgroundSecondaryText
                text: root.tr("Klondike solitaire with Swedish and English, saved games and undo.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                textSize: Label.Small
                color: theme.palette.normal.backgroundSecondaryText
                text: root.tr("Version %1").arg(root.version) + " · © 2026 Johan Finn · GPLv3"
            }
        }
    }
}
