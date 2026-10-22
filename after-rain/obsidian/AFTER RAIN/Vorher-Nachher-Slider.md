---
tags: [projekt/after-rain, interaktion, barrierefreiheit, touch]
erstellt: 2026-10-22
---

# Vorher-Nachher-Slider

Vergleich trocken/nass in [[00 AFTER RAIN – Übersicht|AFTER RAIN]].

## Aufbau
```html
<div class="compare__frame" style="--pos:50%">
  <img data-img="dry">
  <div class="compare__wet"><img data-img="wet"></div>   <!-- clip-path: inset(0 0 0 var(--pos)) -->
  <input type="range" class="compare__range">            <!-- unsichtbar, aber fokussierbar -->
  <span class="compare__handle"><span class="knob">…</span></span>
</div>
```
Links ist trocken, rechts nass. Eine einzige CSS-Variable `--pos` steuert den Clip und die Griffposition.

## Warum Pointer-Events statt nur `<input type="range">`
- **iOS Safari** lässt einen Range-Input nur am Daumen ziehen. Ein Tippen auf die Spur tut nichts. Ein über das Bild gelegter, unsichtbarer Range ist dort also kaum bedienbar.
- Lösung: `pointerdown` mit `setPointerCapture`, dann `pointermove` auf dem Rahmen, Position = `(clientX - left) / width`.
- **`touch-action: pan-y`** auf dem Rahmen: Vertikales Wischen scrollt die Seite weiter, horizontales Ziehen bewegt den Slider.
- Der Range-Input bleibt für **Tastatur und Screenreader** (Pfeiltasten, `aria-label`). Den Fokus zeigt der Griff über den Geschwister-Selektor `.compare__range:focus-visible ~ .compare__handle .knob`.

## Intro-Hinweis
Wird der Slider zum ersten Mal zur Hälfte sichtbar, wandert er einmal 50 → 74 → 30 → 50 %, damit klar ist, dass er bedienbar ist. Sobald der Nutzer selbst eingreift (`touched`), bricht das sofort ab. Bei Reduced Motion entfällt der Hinweis.

## Voraussetzung
Beide Fotos brauchen **exakt denselben Bildausschnitt**, sonst springt die Jacke an der Trennlinie. Das gilt genauso für den Crossfade in [[Rain-Reveal-Animation]].
