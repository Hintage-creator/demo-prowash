---
tags: [projekt/after-rain, canvas, bilder, playwright]
erstellt: 2026-10-22
---

# Prozedurale Produktbilder

Die echten Fotos der Jacke lagen nicht vor. Statt Stockfotos (falsches Produkt, unklare Lizenz, kein passendes Nass-Gegenstück) wurden **provisorische Bilder per Canvas gerendert**: `after-rain/tools/render-provisional.mjs`.

## Warum selbst rendern
- Trocken und nass müssen **pixelgenau dieselbe Geometrie** haben, sonst funktionieren Crossfade und Slider nicht.
- Keine Lizenzfragen.
- Ergebnis: eine saubere Illustration, kein Fotorealismus. Gut genug, um Layout und Animation zu beurteilen, aber nicht für den Launch.

## Pipeline
Playwright öffnet Chromium, `page.evaluate(render, 'dry' | 'wet')` zeichnet auf einem Canvas mit 1200 × 1500 px, und `toDataURL('image/jpeg', .9)` wird als Datei geschrieben.

Zeichenreihenfolge: Ärmel → Kapuze mit dunkler Gesichtsöffnung → Stehkragen → Körper (mit Schatten auf die Ärmel) → Reißverschluss und Taschen → Gesamtlicht → (nass: Muster und Tropfen) → Studio-Hintergrund mit Bodenschatten, Vignette und Korn.

## Techniken
- **Gesteppte Kanäle**: Pro Kanal ein vertikaler Verlauf (dunkle Naht, Glanzkante bei 34 %, Schatten unten) plus ein horizontaler „Zylinder“-Verlauf (dunkler zu den Seiten, Licht von links).
- **Gewellter Umriss**: Die Seitenkanten laufen pro Kanal per `quadraticCurveTo` mit Ausbuchtung (siehe Funktion `sides()`).
- **Ärmel in lokalen Koordinaten**: `translate` und `rotate(atan2(-dx, dy))`, dann wie eine senkrechte Säule zeichnen.
- **Cheetah-Flecken**: Jitter-Raster (Zelle 38 px), jeder Fleck ein unregelmäßiges Polygon mit 9 Punkten, geglättet über Mittelpunkte und `quadraticCurveTo`. Ein **seeded RNG (mulberry32)** macht das Ergebnis reproduzierbar.
- **Tonales Muster per Multiply**: Die Flecken-Ebene (Grund hellrosa, Flecken dunkler) wird mit `globalCompositeOperation = 'multiply'` aufgelegt. Die Schattierung bleibt erhalten, das Muster wirkt „im Stoff“.
- **Nässe**: Glanzkanten schmaler und heller, Gesamtton tiefer, 190 Wasserperlen mit Glanzpunkt, nur dort, wo die Jacke ist (Alpha-Abfrage).

## Bild-Resolver auf der Seite
`images/jacket-*.jpg|jpeg|png|webp` → Vorschau aus `localStorage` (über „Try your own photos“ hochgeladen und auf 1800 px verkleinert) → sonst ein in der Seite gerenderter, **sichtbar beschrifteter Platzhalter**. Mit `CONFIG.provisional = true` erscheint im Footer der Hinweis „Product imagery is provisional“.

## Gelernt
Siehe [[Lessons Learned – Bugs]]: der Halo-Fehler beim Multiply und das Problem mit `NODE_PATH` bei ES-Modulen.
