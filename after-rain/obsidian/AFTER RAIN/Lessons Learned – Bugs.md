---
tags: [projekt/after-rain, lessons-learned, css, debugging]
erstellt: 2026-10-22
---

# Lessons Learned – Bugs

Fehler, die beim Testen von [[00 AFTER RAIN – Übersicht|AFTER RAIN]] in Chromium (Playwright, Desktop 1440 px und Mobil 390 px) gefunden wurden. Alle sind behoben. Merksatz: **Erst im echten Browser prüfen, dann veröffentlichen.**

## 1. Alle Sektionen unsichtbar: Specificity
```css
html.js .reveal-up{ opacity:0; }   /* Spezifität 0,2,1 */
.reveal-up.in{ opacity:1; }        /* Spezifität 0,2,0 → verliert! */
```
Alles nach dem Hero blieb unsichtbar, obwohl `.in` gesetzt war.
**Fix:** `html.js .reveal-up.in{…}`
**Regel:** Bekommt ein Ausgangszustand einen Präfix-Selektor, braucht der Zielzustand denselben Präfix.

## 2. `[hidden]` wird von `display:flex` überschrieben
Das Foto-Panel hatte das Attribut `hidden`, aber `.studio__panel{display:flex}` gewann. Mobil verdeckte es den Haupt-Button.
**Fix:** `[hidden]{ display:none !important; }` global.
**Regel:** Jede Komponente, die eine eigene `display`-Regel hat und per `hidden` getoggelt wird, braucht diese Regel.

## 3. Heller Halo um die nasse Jacke (Canvas-Multiply)
Multiply auf halbtransparente Schattenpixel (vom `shadowBlur`) ergibt dort die helle Farbe der Flecken-Ebene.
**Fix:** Eine Maske nur aus **voll deckenden** Pixeln bauen (Alpha > 250), die Flecken-Ebene damit `destination-in` beschneiden und erst dann multiplizieren.
Siehe [[Prozedurale Produktbilder]].

## 4. `backdrop-filter` macht `position: fixed` relativ
Ein Element mit `backdrop-filter` (wie `filter` oder `transform`) wird zum Containing Block für fixierte Nachfahren. Ein Vollbild-Menü **innerhalb** der Glas-Navigation wäre nur so groß wie die Navigation.
**Lösung (vorab vermieden):** Das Mobil-Menü ist ein eigenes Element außerhalb des Headers.

## 5. ES-Module ignorieren `NODE_PATH`
`import { chromium } from 'playwright'` fand das global installierte Paket nicht (`ERR_MODULE_NOT_FOUND`).
**Fix:** `createRequire(import.meta.url)('playwright')`. CommonJS-`require` beachtet `NODE_PATH`.

## 6. Range-Input auf iOS
Ein unsichtbarer, über das Bild gelegter `<input type="range">` lässt sich auf iOS nur am Daumen ziehen. Lösung siehe [[Vorher-Nachher-Slider]].

## 7. `scroll-behavior: smooth` gegen eigenes Smooth Scrolling
Beides gleichzeitig führt zu doppelt animiertem, ruckelndem Scrollen. Siehe [[Scroll-Animationen und rAF-Loop]].

## 8. Typografie: „W ait“
Das große „W“ in Bodoni Moda hat viel Seitenabstand und wirkt in Headlines wie ein Leerzeichen.
**Fix:** `<span class="kern-w">W</span>` mit `margin-right: -.09em`.

## 9. Kursive Glyphen in Masken-Zeilen
Bei `overflow:hidden` für Zeilen-Reveals wird der Überhang der Kursiven rechts und unten abgeschnitten.
**Fix:** `padding: 0 .12em .1em 0` und `margin-bottom: -.1em`.
