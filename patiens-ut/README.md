# Patiens – Klondike för Ubuntu Touch

En klassisk Klondike-patiens i ren QML och Lomiri Components. Svenska och engelska,
sparat spel, ångra och ledtrådar. Ingen reklam och inga nätverksbehörigheter.

## Funktioner

- 7 högar i borden, 4 fundament och en hög (stock) med drag 1 eller 3 kort.
- Tryck på ett kort för att välja hela följden, tryck sedan på målet. Tryck på det
  valda kortet igen för att lägga det direkt på ett fundament.
- Ledtråd som visar ett möjligt drag med text och markering, samt "Spela klart" när
  alla kort är vända upp.
- Ångra varje drag, starta om samma giv, ny giv med bekräftelse.
- Timer, drag och poäng (5/10 poäng för kort från kasten, 5 för uppvänt kort,
  −15 för kort tillbaka från fundamentet).
- Automatisk sparning; spelet fortsätter där du slutade.
- Inställningar för språk (automatiskt/svenska/engelska), tema och antal drag.
- Hjälpsida med regler och poäng.

## Kod

- `qml/Logic.js` – hela spelreglerna och spelstaten i ren JS (xorshift32 för
  reproducerbara givar). Testas i node utan Qt.
- `qml/GamePage.qml` – spelbordet och alla interaktioner.
- `qml/Card.qml` – kortet ritas med QML-rektanglar och färger (inga externa bilder).
- `qml/Storage.js` – `QtQuick.LocalStorage` för inställningar och sparat spel.
- `qml/I18n.js` – svensk översättning tabell, `tr(s, lang)`.
- `qml/SettingsPage.qml`, `qml/HelpPage.qml` – inställningar och regler.

Licens: GPL-3.0-or-later.

## Testa

```bash
node tests/logic.test.js     # regler, drag, ångra, sparning, ledtrådar
node tests/i18n.test.js      # alla texter finns på svenska
qmlscene -I . qml/Main.qml --fresh --lang=sv --deal=42
```

Flaggor: `--demo` (egen databas), `--fresh` (ny giv), `--deal=<seed>`,
`--draw=1|3`, `--lang=sv|en`, `--theme=light|dark`,
`--page=settings|help|game`, `--width=<gu>`, `--height=<gu>`.

## Bygga och installera

```bash
clickable build
adb push build/all/app/patiens_0.1.0_all.click /home/phablet/Downloads/
adb shell gdbus call --system --dest com.lomiri.click --object-path /com/lomiri/click \
  --method com.lomiri.click.Install /home/phablet/Downloads/patiens_0.1.0_all.click
```
