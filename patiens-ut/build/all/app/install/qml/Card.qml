// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12

Item {
    id: card

    property int rank: 1
    property int suit: 0
    property bool faceUp: true
    property bool selected: false
    property bool hinted: false

    readonly property bool red: suit === 1 || suit === 2
    readonly property string rankLabel: ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][rank]
    readonly property string suitLabel: ["\u2660", "\u2665", "\u2666", "\u2663"][suit]
    readonly property color ink: red ? "#b3261e" : "#1d232b"

    // Skugga
    Rectangle {
        anchors.fill: parent
        anchors.leftMargin: card.width * 0.012
        anchors.topMargin: card.height * 0.014
        radius: card.width * 0.09
        color: "#00000030"
    }

    Rectangle {
        id: face
        anchors.fill: parent
        radius: card.width * 0.09
        color: card.faceUp ? "#fbfaf3" : "#1b3a68"
        border.width: card.selected ? Math.max(2, card.width * 0.045)
                                    : Math.max(1, card.width * 0.014)
        border.color: card.selected ? "#f6b93b"
                                    : (card.hinted ? "#5fd18a" : "#c3c8cf")
        Behavior on border.color { ColorAnimation { duration: 120 } }

        // ---- Framsidan ----
        Item {
            anchors.fill: parent
            visible: card.faceUp

            Column {
                x: card.width * 0.07
                y: card.height * 0.025
                spacing: -card.height * 0.02
                Text {
                    text: card.rankLabel
                    color: card.ink
                    font.bold: true
                    font.pixelSize: card.height * (card.rank === 10 ? 0.135 : 0.165)
                }
                Text {
                    text: card.suitLabel
                    color: card.ink
                    font.pixelSize: card.height * 0.13
                }
            }

            // Spegelvänd hörna nere till höger
            Item {
                anchors.fill: parent
                rotation: 180
                Column {
                    x: card.width * 0.07
                    y: card.height * 0.025
                    spacing: -card.height * 0.02
                    Text {
                        text: card.rankLabel
                        color: card.ink
                        font.bold: true
                        font.pixelSize: card.height * (card.rank === 10 ? 0.135 : 0.165)
                    }
                    Text {
                        text: card.suitLabel
                        color: card.ink
                        font.pixelSize: card.height * 0.13
                    }
                }
            }

            Text {
                anchors.centerIn: parent
                anchors.verticalCenterOffset: card.height * 0.03
                text: card.suitLabel
                color: card.ink
                font.pixelSize: card.height * 0.38
                opacity: 0.92
            }
        }

        // ---- Baksidan ----
        Item {
            anchors.fill: parent
            anchors.margins: card.width * 0.075
            visible: !card.faceUp

            Rectangle {
                anchors.fill: parent
                radius: card.width * 0.05
                color: "#20457a"
                border.color: "#d9b45a"
                border.width: Math.max(1, card.width * 0.018)
            }

            Rectangle {
                anchors.centerIn: parent
                width: parent.width * 0.52
                height: width
                color: "transparent"
                border.color: "#e0bf6a"
                border.width: Math.max(1, card.width * 0.016)
                rotation: 45
                opacity: 0.9
            }

            Rectangle {
                anchors.centerIn: parent
                width: parent.width * 0.22
                height: width
                color: "#d9b45a"
                rotation: 45
                opacity: 0.75
            }

            Rectangle {
                anchors.centerIn: parent
                width: parent.width * 0.07
                height: width
                radius: width / 2
                color: "#20457a"
            }
        }
    }
}
