---
tags: [projekt/after-rain, webdesign, moc]
erstellt: 2026-10-22
status: prototyp
repo: Hintage-creator/demo-prowash
branch: after-rain-launch-page
pfad: after-rain/index.html
vorschau: https://claude.ai/artifact/EmiFZoxtRjGzdszScWJP4C
---

# AFTER RAIN – Übersicht

Launch-Landingpage für eine burgunderrote Pufferjacke, deren tonales Cheetah-Muster erst bei Nässe sichtbar wird. Claim: **„Quiet by nature. Wild by rain.“**

Eine einzige HTML-Datei mit CSS und JavaScript inline. Kein Build-Schritt, keine JS-Bibliotheken. Extern geladen werden nur die Google Fonts.

## Aufbau der Seite
1. Navigation: fixiert, wird beim Scrollen zu Glas mit Blur, mobil ein eigenes Vollbild-Menü
2. Hero: Headline mit Zeilen-Masken-Reveal, Jacke im Bogenrahmen, schwebende Chips
3. Marquee: zwei Bänder, Tempo koppelt an die Scroll-Geschwindigkeit
4. **Reveal-Stage**: Regen, Blitz, Crossfade trocken → nass ([[Rain-Reveal-Animation]])
5. Vorher/Nachher-Slider ([[Vorher-Nachher-Slider]])
6. Materialkonzept mit Scroll-gesteuerter „Nass-Werdung“ eines Stoffkreises
7. Detailkarten: Farbe, Silhouette, Textur, Design
8. Finale mit Waitlist-Formular und leichtem Nieselregen
9. Footer mit Outline-Wortmarke, über die beim Scrollen ein Lichtstreif läuft

## Wissens-Notizen
- [[Rain-Reveal-Animation]] – das Kern-Feature, Zeitachse und Technik
- [[Canvas-Regen-Partikelsystem]] – performanter Regen mit Canvas
- [[Scroll-Animationen und rAF-Loop]] – Smooth Scroll, Parallax, Marquee, Scrubs, Reveals
- [[Load-Sequenz und Failsafe]] – Einstiegsanimation ohne Risiko unsichtbarer Inhalte
- [[Vorher-Nachher-Slider]] – barrierearm und touch-tauglich
- [[Mikrointeraktionen]] – magnetische Buttons, Karten-Glow, Licht auf dem Bild
- [[Prozedurale Produktbilder]] – provisorische Bilder per Canvas rendern
- [[Design-Tokens AFTER RAIN]] – Farben, Schriften, Typo-Skala
- [[Lessons Learned – Bugs]] – gefundene Fehler und ihre Ursachen
- [[Offene Punkte AFTER RAIN]] – was vor dem Launch fehlt

## Kernentscheidungen
- **Ein einziger `requestAnimationFrame`-Loop** für alle scrollabhängigen Effekte statt vieler Listener
- **Nur `transform` und `opacity` animieren**, außer bewusst gesetztem `clip-path` und `mask`
- **`prefers-reduced-motion`** schaltet Regen, Parallax, Marquee und Smooth Scroll ab; der Crossfade bleibt kurz erhalten
- **Bilder über einen Resolver**: echtes Foto → lokale Vorschau → klar beschrifteter Platzhalter. Es gibt nie einen kaputten Bildpfad.
