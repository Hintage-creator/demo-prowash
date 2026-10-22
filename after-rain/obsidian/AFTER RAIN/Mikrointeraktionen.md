---
tags: [projekt/after-rain, interaktion, css, hover]
erstellt: 2026-10-22
---

# Mikrointeraktionen

Hover- und Pointer-Effekte aus [[00 AFTER RAIN – Übersicht|AFTER RAIN]]. Alle laufen nur bei `(hover: hover) and (pointer: fine)`, also nicht auf Touch-Geräten.

## Magnetische Buttons
```js
btn.style.translate = `${dx * .18}px ${dy * .28}px`;   // bei pointermove
btn.style.translate = '0 0';                          // bei pointerleave
```
Hier wird die **eigenständige CSS-Eigenschaft `translate`** verwendet, nicht `transform`. Dadurch kollidiert der Magnet-Effekt nicht mit `scale:.97` beim `:active`. Beide werden unabhängig transitioniert.

## Button-Füllung von unten
`::before` mit Weinrot-Verlauf liegt bei `translateY(102%)` und fährt bei Hover auf `0`. Die Textfarbe wechselt von Tinte zu Creme. Der Pfeil rückt 4 px nach rechts. Der Button hat `isolation:isolate`, damit `z-index:-1` des Pseudo-Elements im Button bleibt.

## Karten-Glow
```css
.card::after{ background: radial-gradient(320px circle at var(--mx) var(--my), rgb(255 232 222 / .09), transparent 70%); }
```
JS setzt `--mx/--my` in Pixeln relativ zur Karte. Dazu kommen Anheben um 6 px und ein Zoom des Bildes (`scale(calc(var(--z) * 1.07))`). `--z` und `--o` (Origin) pro Karte erlauben verschiedene Detailausschnitte aus **demselben** Foto.

## Licht auf dem Produktbild
Auf der Reveal-Stage folgt ein weicher Radial-Lichtfleck (`mix-blend-mode: screen`) dem Cursor, über `--lx/--ly` in Prozent.

## Link-Unterstreichung
Eine `::after`-Linie skaliert von `.3` auf `1`. Bei der Navigation wechselt der `transform-origin` zwischen Hover-In und Hover-Out, sodass die Linie von links herein- und nach rechts hinausläuft.
