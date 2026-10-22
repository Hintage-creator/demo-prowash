---
tags: [projekt/after-rain, animation, css, robustheit]
erstellt: 2026-10-22
---

# Load-Sequenz und Failsafe

Wie der Hero von [[00 AFTER RAIN – Übersicht|AFTER RAIN]] beim Laden wie eine Kampagne aufgebaut wird, ohne dass Inhalte unsichtbar bleiben, falls JavaScript ausfällt.

## Drei Zustandsklassen auf `<html>`
| Klasse | Gesetzt durch | Bedeutung |
|---|---|---|
| `js` | Inline-Script im `<head>`, vor dem ersten Paint | Ausgangszustände für Animationen dürfen versteckt sein |
| `is-loaded` | nach `document.fonts.ready`, höchstens 900 ms | Einstiegssequenz starten |
| `ready` | am **Ende** der Initialisierung im Hauptscript | Script lief vollständig |

Ohne JS gibt es keine Klasse `js`, und alles ist sofort sichtbar.

## Failsafe
Wirft das Hauptscript einen Fehler, fehlt `ready`. Dann blendet eine verzögerte Animation alles nach 2,5 s ein:
```css
@keyframes failsafe{ to{ opacity:1; transform:none; clip-path:none; } }
html.js:not(.ready) .load,
html.js:not(.ready) .load-line,
html.js:not(.ready) .reveal-up{ animation:failsafe 0s 2.5s forwards; }
```
Wird `ready` gesetzt, greift der Selektor nicht mehr, und die normalen Transitions übernehmen.

## Einstiegs-Bausteine
- **Zeilen-Masken-Reveal**: `.line{overflow:hidden}` und darin `.load-line` mit `translateY(112%)` → `0`. Kursive Glyphen brauchen rechts Padding (`.12em`), sonst wird der Überhang abgeschnitten.
- **Gestaffelte Verzögerung** über die Inline-Variable `style="--d:.42s"`.
- **Bogenrahmen öffnet sich**: `clip-path: inset(22% 0 0 0 round 28px)` → `inset(0 0 0 0 round 0px)` über 1,8 s.
- **Bild-Zoom**: `scale(1.16)` und `opacity:0` → `scale(1)`, aber erst wenn das Bild `data-ready` hat. Es wird also nie ein halb geladenes Bild animiert.
- **Lichtstreif**: Ein schräger Verlauf (`skewX(-12deg)`) wandert alle 9 s über das Bild.
- **Schwebende Chips** mit Glas-Look (`backdrop-filter`) und versetzten `float`-Animationen.
- **Shimmer-Text**: `background-clip:text` mit einem breiten Verlauf, der durchläuft.

## Bilder nie kaputt anzeigen
```css
html.js img[data-img]:not([data-ready]){ visibility:hidden; }
```
Der Resolver ([[Prozedurale Produktbilder]]) setzt `data-ready` erst nach `load`. So ist nie ein Broken-Image-Icon zu sehen.
