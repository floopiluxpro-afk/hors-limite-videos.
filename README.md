# Hors Limite — usine à vidéos TikTok

Vidéos verticales 1080×1920, 30 fps, 45-60 s, montées avec [Remotion](https://remotion.dev) :
images « figurines en pâte à modeler » (Gemini), voix off française (ElevenLabs),
sous-titres mot par mot calés sur la vraie voix, musique taiko et bruitages synthétisés (libres de droits).

## Installation

```bash
npm install
cp .env.example .env   # puis renseigne GEMINI_API_KEY et ELEVENLABS_API_KEY (ou variables d'environnement)
```

## Faire une nouvelle vidéo

```bash
npm run new -- mon-sujet              # crée videos/mon-sujet/script.txt (une phrase par ligne)
npm run storyboard -- mon-sujet       # Gemini propose videos/mon-sujet/storyboard.json
npm run decoupage -- mon-sujet        # écrit DECOUPAGE.md (plans, images, timecodes estimés) → à valider
npm run make -- mon-sujet             # voix + images + audio + timeline + captures (out/mon-sujet/planche-contact.jpg)
npm run render -- mon-sujet           # export final out/mon-sujet/mon-sujet.mp4
```

Étapes séparées : `voice`, `images`, `audio`, `timeline`, `preview`, `studio` (aperçu interactif).

- Régénérer une image : `npm run images -- mon-sujet --only 07c --force`
- Changer les silences sans repayer la voix : modifier `pauseAfter` puis `npm run voice -- mon-sujet --repause`
- Tester le montage sans voix ni images : `npm run timeline -- mon-sujet --estimate` (cartons + timings estimés)

## Le storyboard (`videos/<slug>/storyboard.json`)

C'est la seule source de la vidéo :

- `characters` : description physique/tenue fixe de chaque personnage. Une image de référence est générée par personnage
  (`public/<slug>/refs/`) puis passée à Gemini à chaque plan où il apparaît → mêmes visages, même judogi.
- `lines[].text` : une phrase de voix off. `{1,98 m|un mètre quatre-vingt-dix-huit}` = affiché | prononcé.
- `lines[].shots[]` : `image` (prompt), `cue` (mot où tombe la coupe), `motion` (zoomIn, zoomOut, panLeft, panRight, panUp),
  `transition` (whip, zoom, flash, cut), `impact` (`hard` = zoom brusque + tremblement + boom, `soft` = punch-in léger).
- `lines[].overlays[]` : `counter`, `title`, `name` (avec `flag`), `stamp`, `medals`, `logo`, déclenchés sur un `cue`.
- `music: "cut"` coupe la musique sur la phrase, `pauseAfter` ajoute un silence après.

Montage automatique : un plan de plus de 2,4 s est redécoupé en sous-plans recadrés pour garder un changement
toutes les 1,5-2 s ; la musique est baissée automatiquement pendant la voix ; whoosh sur les whips, impacts sur les temps forts.
Sous-titres : 1 à 3 mots, blanc contour noir, mot prononcé en jaune, au centre-bas (hors zones d'interface TikTok).
