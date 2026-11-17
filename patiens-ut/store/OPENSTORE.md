<!-- SPDX-FileCopyrightText: 2026 Johan Finn
     SPDX-License-Identifier: GPL-3.0-or-later -->

# OpenStore-material för Patiens

Allt ligger i `store/`. Skärmdumparna är 1080×1920 (9:16) och tagna direkt i
appen med deterministisk giv (`--deal=42`), utan telefonram eller textöverlägg.

## Appnamn

**Patiens**

## Tagline

**Svenska**

> Klondike som fastnar.

**English**

> Klondike, done right.

Alternativ, något mer informativ tagline (passar om butiken visar färre tecken):

- SV: `Klassisk Klondike – spara, ångra och få ledtrådar.`
- EN: `Classic Klondike with hints, undo and saved games.`

## Beskrivning – svenska

Patiens är en klassisk Klondike-patiens för Ubuntu Touch, byggd i ren QML med
Lomiri-komponenter.

Spela med ett eller tre kort åt gången. Tryck på ett kort för att välja hela
följden och tryck sedan på målet – eller tryck på det valda kortet igen för att
lägga det direkt på ett fundament. Ledtråden markerar ett möjligt drag och
förklarar det i text. När alla kort är uppvända kan du låta appen spela klart.

Spelet sparas automatiskt, så du fortsätter där du slutade. Ångra varje drag,
starta om samma giv eller ta en helt ny giv. Timer, antal drag och poäng håller
koll på utvecklingen. Välj svenska eller engelska och ljust eller mörkt tema.

Ingen reklam. Inga nätverksbehörigheter. Allt körs lokalt på enheten.

## Description – English

Patiens is a classic Klondike solitaire game for Ubuntu Touch, built with pure
QML and Lomiri Components.

Draw one or three cards at a time. Tap a card to select the whole run and then
tap the destination – or tap the selected card again to send it straight to a
foundation. The hint highlights a possible move and explains it in words. Once
every card is face up, you can let the app play out the rest.

Your game is saved automatically, so you can pick up where you left off. Undo
any move, restart the same deal or shuffle a new one. Timer, move count and
score keep track of your progress. Switch between Swedish and English, and
between light and dark themes.

No ads. No network permissions. Everything runs locally on your device.

## Skärmdumpar – rekommenderad ordning

| Fil | Vad den visar | Alt-text (sv) | Alt text (en) |
| --- | --- | --- | --- |
| `01-game-sv.png` | Spelbordet, ljust tema, giv 42 | Spelbord med sju högar, fyra fundament och statistikrad. | Solitaire board with seven tableau piles, four foundations and a stats bar. |
| `02-hint-sv.png` | Ledtråd med markering och förklaring | Ledtråd markerar ett drag och förklarar det i statusraden. | A hint highlights a move and explains it in the status bar. |
| `03-draw3-dark.png` | Mörkt tema, tre kort åt gången | Mörkt tema med tre uppvända kort i kasten. | Dark theme with three cards turned up in the waste pile. |
| `04-settings-sv.png` | Inställningar för språk, tema och drag | Inställningar för språk, tema och antal drag. | Settings for language, theme and draw count. |
| `05-help-en.png` | Hjälpsidan på engelska | Hjälpsidan med regler och poäng på engelska. | Help page with rules and scoring in English. |

## Banner

- `banner.svg` – 1920×1080 (16:9), SVG, samma format som OpenStore-använda banners.
- `banner-preview.png` – 1600×900 PNG, endast för förhandsvisning.

## Övrigt för listningen

- **Kategori:** Games → Card / Puzzle
- **Licens:** GPL-3.0-or-later
- **App-id:** `patiens`
- **Version:** `0.1.0`
- **Framework:** `ubuntu-touch-24.04-1.x`
- **Nyckelord:** klondike, solitaire, patiens, kortspel, card game, puzzle

Tips: `manifest.json` innehåller i dag raden
`"Svenska & English."` – om du vill ha en enhetlig engelsk rad i click-paketet
kan den ändras till `"Swedish & English."` innan nästa bygge. Det påverkar inte
OpenStore-texten ovan.
