---
tags: [projekt/after-rain, animation, canvas, performance, javascript]
erstellt: 2026-10-22
---

# Canvas-Regen-Partikelsystem

Wiederverwendbare `Rain`-Klasse aus [[00 AFTER RAIN – Übersicht|AFTER RAIN]]. Sie läuft in der Reveal-Stage ([[Rain-Reveal-Animation]]) und, reduziert, im Finale.

## Prinzip
- **Intensität statt An/Aus**: `set(target)` setzt einen Zielwert von 0 bis 1. Der aktuelle Wert nähert sich exponentiell an: `level += (target - level) * (1 - exp(-dt / tau))`. Beim Anschwellen ist τ = 0,35 s, beim Abklingen 0,7 s. Dadurch beginnt und endet der Regen weich.
- **Tropfenzahl** = `level × cap`. Die Obergrenze `cap` richtet sich nach der Fläche (`w * h / density`), höchstens `maxDrops`.
- **Drei Tiefenebenen** (fern, mitte, nah), jeweils mit eigener Strichbreite, Deckkraft, Geschwindigkeit und Länge. Das erzeugt Parallaxe im Regen selbst.
- Eine leichte Windneigung über `vx = vy * -0.12`.
- Nur Tropfen der nahen Ebene landen auf zufälliger Höhe im unteren Viertel und erzeugen dort **Splash-Ellipsen**, die sich ausdehnen und verblassen.

## Performance-Kniffe
- **Ein `Path2D` pro Ebene**: Alle Striche einer Ebene werden gesammelt und mit einem einzigen `stroke()` gezeichnet. Das sind 3 Draw-Calls statt Hunderten.
- **DPR auf 1,5 begrenzt**, um große Canvas-Flächen auf Retina-Displays zu entlasten.
- **`IntersectionObserver`**: Außerhalb des Viewports stoppt der Loop.
- **Selbststoppender Loop**: Bei Ziel 0, ohne Tropfen und ohne Splashes beendet er sich und leert das Canvas. `kick()` startet ihn bei Bedarf neu.
- `ResizeObserver` statt `window.resize`, weil sich die Sektionshöhe ändern kann.
- Neue Tropfen starten beim Hochfahren verteilt oberhalb des Canvas (`y = -len - random * h * 0.6`). So fällt keine „Wand“ aus Regen gleichzeitig ein.

## Gerüst
```js
class Rain {
  constructor(canvas, { density = 2600, maxDrops = 420, splash = true } = {}) { … }
  set(target) { this.target = reduce ? 0 : target; this.kick(); }
  tick(t) {
    // 1) level annähern  2) Tropfen auffüllen (max. 14 pro Frame)
    // 3) bewegen, landen → Splash, recyceln oder entfernen
    // 4) je Ebene ein Path2D strichen  5) Splashes zeichnen  6) ggf. stoppen
  }
}
const rain = new Rain(canvas);
const finaleRain = new Rain(canvasFinale, { density: 5200, maxDrops: 220, splash: false });
```

## Wiederverwendbar für
Schnee (langsamer, runde Punkte statt Striche), Funken, Staub im Licht. Dazu nur die Ebenen-Parameter und die Zeichenform ändern.
