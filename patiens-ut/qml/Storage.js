.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
.import QtQuick.LocalStorage 2.0 as Sql

var _db = null
var _name = "patiens"

function useDatabase(name) {
    _name = name
    _db = null
}

function db() {
    if (_db) return _db
    _db = Sql.LocalStorage.openDatabaseSync(_name, "1.0", "Patiens", 1000000)
    _db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
    })
    return _db
}

function setting(key, fallback) {
    var v = fallback
    db().readTransaction(function (tx) {
        var rs = tx.executeSql("SELECT value FROM settings WHERE key = ?", [key])
        if (rs.rows.length > 0 && rs.rows.item(0).value !== null) v = rs.rows.item(0).value
    })
    return v
}

function setSetting(key, value) {
    db().transaction(function (tx) {
        tx.executeSql("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, String(value)])
    })
}

function removeSetting(key) {
    db().transaction(function (tx) {
        tx.executeSql("DELETE FROM settings WHERE key = ?", [key])
    })
}
