---
tags: [projekt/after-rain, animation, css, javascript]
erstellt: 2026-10-22
---

# Rain-Reveal-Animation

Das Kern-Feature von [[00 AFTER RAIN – Übersicht|AFTER RAIN]]: Ein Button „Reveal the cheetah“ verwandelt das trockene Produktfoto in das nasse mit sichtbarem Muster, und wieder zurück.

## Zeitachse (trocken → nass)
| Zeit | Ereignis |
|---|---|
| 0 ms | Klasse `is-raining` auf der Sektion, Regen-Intensität auf 1 ([[Canvas-Regen-Partikelsystem]]), Nebel blendet ein |
| 380 ms | Lichtblitz (Doppel-Flackern über `@keyframes`) |
| 600 ms | Klasse `is-wet`: Crossfade mit „Durchnässen“ von oben nach unten, Lichtstreif über das Bild, Beschriftung rollt von „Before the rain“ zu „After the rain“ |
| 2500 ms | Regen fällt auf Nieseln (0.22), Button-Text wird „Return to dry“, Button wieder bedienbar |

Zurück: Regen auf 0, `is-wet` entfernen, das nasse Bild zieht sich nach oben zurück, nach 1700 ms ist der Button wieder frei.

Während des Übergangs blockiert ein `busy`-Flag Doppelklicks. Der Button bekommt dabei `aria-disabled="true"` statt `disabled`, damit der Tastaturfokus erhalten bleibt.

## Der „Durchnässen“-Crossfade
Das nasse Bild liegt über dem trockenen. Es wird gleichzeitig über `opacity` **und** eine wandernde Gradient-Maske eingeblendet. Damit eine CSS-Variable animierbar ist, muss sie mit `@property` registriert sein:

```css
@property --soak { syntax:'<percentage>'; inherits:false; initial-value:-30%; }

.stage__img--wet{
  opacity:0;
  mask-image:linear-gradient(180deg, #000 calc(var(--soak) - 25%), transparent calc(var(--soak) + 5%));
  transition:opacity 1.4s, --soak 1.6s, transform 1.8s;
}
.reveal.is-wet .stage__img--wet{ opacity:1; --soak:135%; transform:scale(1.05); }
```

- Ohne `@property`-Support springt die Maske, aber `opacity` blendet trotzdem weich. Das ist eine akzeptable Fallback-Stufe.
- Der langsame `scale(1.05)` über 4,5 s ist der „subtile Zoom“, der das neue Bild hervorhebt.
- Das trockene Bild wird gleichzeitig leicht gezoomt und abgedunkelt (`brightness(.82)`), damit der Übergang Tiefe bekommt.

## Atmosphäre-Ebenen (von hinten nach vorn)
1. `.reveal::before`: dunklerer, kühlerer Verlauf, blendet bei `is-wet` ein
2. `.mist`: zwei driftende Radialverläufe als Nebel
3. Bild-Stack: trocken, nass, Vignette, **Wassertropfen auf dem Bild**, Pointer-Licht, Lichtstreif
4. `<canvas class="rain">` über der ganzen Sektion
5. `.flash` mit `mix-blend-mode: screen`

## Wassertropfen auf dem Bild
22 `<i class="drop">` werden per JS mit einem **seeded Zufallsgenerator** erzeugt, damit das Layout bei jedem Laden gleich bleibt. Jeder Tropfen hat eigene CSS-Variablen (`--x --y --s --t --dl --fall`) und läuft eine Keyframe-Animation: erscheinen, langsam abwärts gleiten, verblassen. Das Aussehen entsteht durch einen Radialverlauf mit Glanzpunkt oben links.

## Barrierefreiheit
- `aria-pressed` auf dem Button spiegelt den Zustand
- Ein visuell verstecktes `aria-live="polite"`-Element sagt den neuen Zustand an
- Bei Reduced Motion: kein Regen, kein Blitz, keine Tropfen, Crossfade in 0,5 s

## Hero-CTA koppeln
Der „Reveal the cheetah“-Button im Hero scrollt zuerst zur Stage (zentriert, siehe [[Scroll-Animationen und rAF-Loop]]) und löst den Reveal erst nach Ankunft aus. `scrollToY()` gibt dafür ein Promise zurück.
