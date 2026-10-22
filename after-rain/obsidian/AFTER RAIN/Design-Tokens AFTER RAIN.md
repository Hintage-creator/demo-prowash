---
tags: [projekt/after-rain, design, tokens, typografie]
erstellt: 2026-10-22
---

# Design-Tokens AFTER RAIN

Bewusst **nur ein dunkler Look**, wie bei einer Kampagne, mit `color-scheme: dark`. Kein Hell-Modus. Gehört zu [[00 AFTER RAIN – Übersicht|AFTER RAIN]].

## Farben
| Token | Wert | Rolle |
|---|---|---|
| `--ink` | `#0b0607` | Seitengrund, fast schwarz mit Rotstich |
| `--night` | `#140a0c` | erhöhter Grund |
| `--bordeaux` | `#2b0b12` | Tiefe, Bildhintergründe |
| `--burgundy` | `#5e1424` | Familie der Jacke |
| `--wine` | `#8c2539` | interaktiver Akzent (Button-Füllung, Spots) |
| `--blush` | `#d6a49f` | kursive Hervorhebungen, Nass-Zustand |
| `--cream` | `#efe5d8` | Text, primärer Button |
| `--jacket` | zur Laufzeit | Farbe, die aus dem trockenen Foto gemessen wird |

Abstufungen von Creme mit Alpha: `.68` für Fließtext, `.44` für Labels, `.12` für Linien.

## Schriften
- **Display**: Bodoni Moda (Didone, Mode-Magazin-Charakter, optische Größen), Fallback Bodoni 72, Didot, Georgia
- **Text**: Instrument Sans, Fallback Systemschrift (`-apple-system`)
- Kursiv-Akzente in der Display-Schrift tragen die Emotion („*Wild by rain.*“)

## Typo-Skala
| Token | Wert |
|---|---|
| `--fs-hero` | `clamp(2.75rem, 5.9vw, 5.6rem)`, mobil `clamp(2.5rem, 11.4vw, 3.4rem)` |
| `--fs-display` | `clamp(2.35rem, 5vw, 4.75rem)` |
| `--fs-h3` | `1.5rem` |
| `--fs-body` | `1.0625rem` |
| `--fs-label` | `.72rem`, Versalien, Laufweite `.22–.26em` |

Hero-Größe: Sie ist so gewählt, dass „Quiet by nature.“ in der halben Spalte einzeilig bleibt (Faustregel Bodoni: etwa 0,47 em pro Zeichen).

## Easing
- `--ease-out: cubic-bezier(.16,1,.3,1)` für fast alles: schnell los, sehr weich aus
- `--ease-io: cubic-bezier(.65,0,.35,1)` für Crossfades und Lichtstreifen

## Layout
- Max-Breite 1320 px, Seitenrand `clamp(20px, 4.5vw, 64px)`, mit `env(safe-area-inset-*)` kombiniert
- Sektionsabstand `clamp(96px, 13vw, 184px)`
- Bildrahmen: 4:5, Höhe begrenzt über `width: min(100%, calc((100svh - 150px) * .8))`
- Hero-Bild im **Bogen** (`border-radius: 999px 999px 28px 28px / 42% 42% 28px 28px`), Stage im weichen Rechteck mit 28 px Radius

## Bewusst vermieden
Gleichförmige Karten mit Schatten überall, Emoji, Lila-Blau-Verläufe, Effekt-Overload. Die Kühnheit sitzt an **einer** Stelle: der Reveal.
