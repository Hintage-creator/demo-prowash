---
tags: [projekt/after-rain, animation, scroll, performance, javascript]
erstellt: 2026-10-22
---

# Scroll-Animationen und rAF-Loop

Alle scrollabhängigen Effekte von [[00 AFTER RAIN – Übersicht|AFTER RAIN]] laufen in **einem** `requestAnimationFrame`-Loop. Pro Frame wird zuerst gelesen (`getBoundingClientRect`), dann geschrieben (`transform` bzw. CSS-Variablen).

## 1. Smooth Wheel Scrolling (nur Desktop)
- Aktiv nur bei `(hover: hover) and (pointer: fine)` und ohne Reduced Motion.
- `wheel`-Listener mit `passive:false` → `preventDefault()` → Zielposition sammeln. Im Loop wird mit framerate-unabhängigem Lerp angenähert: `current += (target - current) * (1 - (1 - 0.12) ** (dt * 60))`.
- `deltaMode` umrechnen: Zeilen × 32, Seiten × Viewporthöhe.
- **Abbruch** bei Tastatur-Scrolltasten, `touchstart` und Maus-`pointerdown` (z. B. am Scrollbar-Griff).
- Ausnahmen: `ctrlKey` (Zoom), horizontale Gesten, eigene Scroll-Container (Menü, Foto-Panel).
- ⚠️ **Kein `scroll-behavior: smooth` im CSS**, sonst animiert jedes `window.scrollTo()` pro Frame zusätzlich.
- Abwägung: Manche Nutzer empfinden abgefangenes Scrollen als träge. Die Funktion lässt sich an einer Stelle abschalten (`smooth.enabled`).

## 2. Geeaster Anker-Scroll
Eigene Funktion `scrollToY(y)` mit `easeInOutCubic` und einer Dauer von `clamp(distanz / 2.4, 650, 1500)` ms. Sie gibt ein **Promise** zurück, damit Aktionen nach der Ankunft folgen können (z. B. den Reveal starten). Ein Lerp ist für lange Distanzen ungeeignet, weil der erste Frame zu weit springt.

Sonderfall: Bei `#reveal` wird der **Bildrahmen vertikal zentriert**, nicht der Sektionsanfang.

## 3. Parallax
```js
const r = p.el.parentElement.getBoundingClientRect(); // Eltern-Element messen!
p.el.style.transform = `translate3d(0, ${(r.top + r.height/2 - vh/2) * speed}px, 0)`;
```
Wichtig: Gemessen wird das **Eltern-Element**. Das verschobene Element selbst zu messen erzeugt eine Rückkopplung, weil sein Rect den eigenen Transform enthält.

## 4. Marquee mit Scroll-Boost
- Inhalt zweimal hintereinander, jede Gruppe breiter als der Viewport.
- `x -= (34 + clamp(|vel| * 0.09, 0, 700)) * dt * dir` und bei `-breite` umbrechen.
- `vel` ist eine geglättete Scroll-Geschwindigkeit (`vel += (v - vel) * .15`).
- Breiten nach `document.fonts.ready` neu messen, denn Webfonts ändern die Breite.

## 5. Scrubs (`data-scrub`)
Jedes Element bekommt `--p` von 0 bis 1 (Fortschritt durch den Viewport). Das CSS übernimmt die Darstellung:
```css
.swatch__wet{
  --r: calc(clamp(0, (var(--p) - .22) * 2.6, 1) * 120%);
  mask-image: radial-gradient(circle farthest-side at 52% 40%, #000 calc(var(--r) - 22%), transparent var(--r));
}
.finale__bg img{ transform: scale(calc(1.22 - var(--p) * .2)); }
```
`--p` wird nur geschrieben, wenn sich der Wert um mehr als 0,0005 ändert.

## 6. Scroll-Reveals
`IntersectionObserver` (Threshold 0,12, `rootMargin` unten −6 %) setzt `.in` und hört danach auf zu beobachten. Die Staffelung kommt aus CSS: `transition-delay: calc(var(--i) * 90ms)`. Siehe auch [[Load-Sequenz und Failsafe]] und den Specificity-Bug in [[Lessons Learned – Bugs]].

## 7. Kleinkram im selben Loop
- Fortschrittslinie oben: `scaleX(scrollY / maxScroll)`
- Nav-Zustand `is-scrolled` (nur bei Änderung togglen)
- Footer-Wortmarke: Hintergrundposition eines Lichtverlaufs (`--fx`) folgt dem Scroll
