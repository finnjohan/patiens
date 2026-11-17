// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "Storage.js" as Storage
import "I18n.js" as I18n

MainView {
    id: root
    objectName: "mainView"
    applicationName: "patiens"
    automaticOrientation: false

    width: units.gu(argValue("width") !== "" ? parseInt(argValue("width"), 10) : 45)
    height: units.gu(argValue("height") !== "" ? parseInt(argValue("height"), 10) : 80)

    readonly property string version: "0.1.0"
    readonly property bool isDark: theme.palette.normal.background.hslLightness < 0.5

    // ---- Kommandoradsflaggor för test och skärmdumpar ---------------------
    // --demo (egen databas)  --fresh (ny giv)  --deal=<seed>  --draw=1|3
    // --lang=sv|en  --theme=light|dark  --page=settings|help|game
    // --width=<gu>  --height=<gu>
    function argValue(name) {
        var args = Qt.application.arguments
        for (var i = 0; i < args.length; i++) {
            if (args[i] === "--" + name) return "1"
            if (args[i].indexOf("--" + name + "=") === 0) return args[i].substring(name.length + 3)
        }
        return ""
    }
    readonly property bool demo: argValue("demo") !== ""
    readonly property bool fresh: argValue("fresh") !== "" || demo
    readonly property int dealParam: argValue("deal") !== "" ? parseInt(argValue("deal"), 10) : 0

    // ---- Inställningar --------------------------------------------------
    property string themeSetting: "auto"
    property string langSetting: "auto"
    property int drawCount: 1
    readonly property string lang: langSetting === "auto" ? I18n.systemLanguage(Qt.locale().name) : langSetting

    function tr(s) { return I18n.tr(s, lang) }

    function applyTheme() {
        if (themeSetting === "dark") theme.name = "Lomiri.Components.Themes.SuruDark"
        else if (themeSetting === "light") theme.name = "Lomiri.Components.Themes.Ambiance"
        else theme.name = ""
    }
    function setTheme(value) { themeSetting = value; Storage.setSetting("theme", value); applyTheme() }
    function setLanguage(value) { langSetting = value; Storage.setSetting("language", value) }
    function setDrawCount(n) { drawCount = n === 3 ? 3 : 1; Storage.setSetting("drawCount", String(drawCount)) }

    Component.onCompleted: {
        if (demo) Storage.useDatabase("patiens-demo")
        langSetting = argValue("lang") !== "" ? argValue("lang") : Storage.setting("language", "auto")
        themeSetting = argValue("theme") !== "" ? argValue("theme") : Storage.setting("theme", "auto")
        drawCount = parseInt(Storage.setting("drawCount", "1"), 10) === 3 ? 3 : 1
        if (argValue("draw") !== "") drawCount = parseInt(argValue("draw"), 10) === 3 ? 3 : 1
        applyTheme()

        var page = argValue("page")
        stack.push(Qt.resolvedUrl("GamePage.qml"))
        if (page === "settings") stack.push(Qt.resolvedUrl("SettingsPage.qml"))
        else if (page === "help") stack.push(Qt.resolvedUrl("HelpPage.qml"))
    }

    PageStack {
        id: stack
        anchors.fill: parent
    }
}
