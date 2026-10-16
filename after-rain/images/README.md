# Product photos

`jacket-dry.jpg` and `jacket-wet.jpg` are currently **provisional renders**
(generated with `node after-rain/tools/render-provisional.mjs`).

To use the real photos, replace them with files of exactly these names:

| File | Content |
|---|---|
| `jacket-dry.jpg` | Dry jacket, solid burgundy |
| `jacket-wet.jpg` | Wet jacket, cheetah pattern visible |

`.jpeg`, `.png` and `.webp` are also detected (e.g. `jacket-dry.png`), but only if
the `.jpg` file of the same name has been removed.
Afterwards, set `provisional: false` in `index.html` (in `CONFIG`).

Important: both photos need the same framing (same crop, same position),
or the crossfade and the before/after slider won't line up.
