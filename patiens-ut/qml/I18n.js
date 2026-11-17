.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Texter på engelska som nyckel, svensk översättning i tabellen.

var languages = [
    { code: "en", name: "English" },
    { code: "sv", name: "Svenska" }
]

var sv = {
    // Spelplan
    "Patiens": "Patiens",
    "New game": "Nytt spel",
    "Undo": "Ångra",
    "Hint": "Ledtråd",
    "Settings": "Inställningar",
    "Play out": "Spela klart",
    "Time": "Tid",
    "Moves": "Drag",
    "Score": "Poäng",
    "Tap a card, then tap where it should go.": "Tryck på ett kort och sedan där det ska ligga.",
    "Tap the stock to turn a card.": "Tryck på högen för att vända ett kort.",
    "No hint right now.": "Ingen ledtråd just nu.",
    "Try moving %1 to %2.": "Prova att flytta %1 till %2.",
    "Try moving %1 to the foundation.": "Prova att lägga %1 på fundamentet.",
    "Turn a card from the stock.": "Vänd ett kort från högen.",
    "Empty": "Tom",

    // Ny giv
    "Start a new game?": "Starta ett nytt spel?",
    "The current game will be lost.": "Det pågående spelet försvinner.",
    "Start": "Starta",
    "Cancel": "Avbryt",
    "Restart this deal?": "Börja om samma giv?",
    "All moves are undone and the deal starts from the beginning.": "Alla drag tas bort och given börjar om från början.",
    "Restart": "Börja om",
    "Same deal": "Samma giv",

    // Vinst
    "Congratulations!": "Grattis!",
    "You cleared the solitaire.": "Du klarade patiensen.",
    "Time: %1 · Moves: %2 · Score: %3": "Tid: %1 · Drag: %2 · Poäng: %3",
    "Play again": "Spela igen",

    // Inställningar
    "Game": "Spel",
    "Draw 1 card": "Dra ett kort",
    "Draw 3 cards": "Dra tre kort",
    "How many cards are turned at a time from the stock.": "Hur många kort som vänds åt gången från högen.",
    "Applies to the next deal.": "Gäller nästa giv.",
    "Theme": "Tema",
    "Language": "Språk",
    "Automatic": "Automatiskt",
    "Light (day)": "Ljust (dag)",
    "Dark (evening)": "Mörkt (kväll)",
    "Automatic (system language)": "Automatiskt (systemets språk)",
    "Rules": "Regler",
    "About": "Om",
    "Klondike solitaire with Swedish and English, saved games and undo.":
        "Klondike-patiens på svenska och engelska, med sparat spel och ångra.",
    "Version %1": "Version %1",

    // Hjälp
    "How to play": "Så spelar du",
    "The goal is to move all 52 cards to the four foundations, from ace to king in each suit.":
        "Målet är att flytta alla 52 kort till de fyra fundamenten, från ess till kung i varje färg.",
    "Tap a card to select it, then tap the pile where it should go. Tap the selected card again to send it straight to a foundation.":
        "Tryck på ett kort för att välja det och tryck sedan på högen där det ska ligga. Tryck på det valda kortet igen för att lägga det direkt på fundamentet.",
    "In the tableau the cards are built downwards in alternating colours. An empty pile only accepts a king.":
        "I borden byggs korten nedåt med växlande färg. En tom hög tar bara emot en kung.",
    "Tap the stock to turn cards. When it is empty, tap it again to turn the waste pile back.":
        "Tryck på högen för att vända kort. När den är tom trycker du igen för att vända tillbaka kasten.",
    "Every move can be undone, and the game is saved automatically when you leave the app.":
        "Varje drag kan ångras, och spelet sparas automatiskt när du lämnar appen.",
    "Cards from the waste give 5 points to the tableau and 10 to the foundations. Turning a card gives 5, and moving a card back from a foundation costs 15.":
        "Kort från kasten ger 5 poäng till borden och 10 till fundamenten. Att vända ett kort ger 5, och att flytta tillbaka ett kort från fundamentet kostar 15."
}

var tables = { sv: sv }

function systemLanguage(localeName) {
    return (localeName || "en").substring(0, 2) === "sv" ? "sv" : "en"
}

function tr(s, lang) {
    var t = tables[lang]
    return (t && t[s] !== undefined) ? t[s] : s
}
