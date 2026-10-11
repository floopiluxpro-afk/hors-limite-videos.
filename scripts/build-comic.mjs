// Timeline d'une vidéo au format BD ("format": "comic" dans le storyboard).
// Résout tous les repères temporels :
//   - "cue" d'une case : mot de la phrase où la case commence,
//   - "at" des éléments / poses / effets : nombre (secondes depuis le début de la case)
//     ou mot de la phrase, avec décalage optionnel ("coup-0.15", "tournoi+0.2").
// Écrit public/<slug>/comic.json, lu par la composition Remotion "Comic".
// Usage : npm run comic -- <slug>
import fs from 'node:fs';
import path from 'node:path';
import {FPS, HEIGHT, WIDTH, getSlug, loadStoryboard, normalizeWord, parseArgs, publicDir, readJson, writeJson} from './lib.mjs';

const LEAD = 0.06; // la case arrive juste avant le mot
const TAIL = 1.4; // fin après la dernière syllabe

const SOUNDS = {hit: 'sfx/hit.wav', crack: 'sfx/crack.wav', tap: 'sfx/tap.wav', boom: 'sfx/impact.wav', pop: 'sfx/pop.wav', whoosh: 'sfx/whoosh.wav'};
const VOLUMES = {hit: 0.55, crack: 0.6, tap: 0.6, boom: 0.75, pop: 0.45, whoosh: 0.4};

export function buildComic(slug) {
  const sb = loadStoryboard(slug);
  const voice = readJson(path.join(publicDir(slug), 'words.json'));
  const words = voice.words;
  const total = Math.max(voice.duration, words.at(-1).end) + TAIL;
  const lineWords = sb.lines.map((_, li) => words.filter((w) => w.line === li));
  const lineStart = sb.lines.map((_, li) => (li === 0 ? 0 : Math.max(0, lineWords[li][0].start - LEAD)));
  const lineEnd = sb.lines.map((_, li) => (li + 1 < sb.lines.length ? lineStart[li + 1] : total));
  const warn = [];

  // "mot", "mot+0.2", "mot-0.1" → instant absolu (premier mot correspondant à partir de `from`).
  function wordTime(li, spec, fromTime = 0) {
    const m = String(spec).match(/^(.*?)([+-]\d+(?:\.\d+)?)?$/);
    const target = normalizeWord(m[1]);
    const offset = m[2] ? parseFloat(m[2]) : 0;
    // "amène" doit aussi trouver "l'amène"
    const match = (x) => {
      const n = normalizeWord(x.text);
      return n.startsWith(target) || n.replace(/^[a-z]+'/, '').startsWith(target);
    };
    const w = lineWords[li].find((x) => x.start >= fromTime - 0.05 && match(x)) ?? lineWords[li].find(match);
    if (!w) {
      warn.push(`ligne ${li + 1} : mot-repère "${m[1]}" introuvable`);
      return null;
    }
    return w.start + offset;
  }

  const panels = [];
  const sfx = [];
  sb.lines.forEach((line, li) => {
    const starts = line.panels.map((p, k) => {
      if (k === 0) return lineStart[li];
      const t = p.cue ? wordTime(li, p.cue, lineStart[li]) : null;
      return t === null ? null : Math.max(lineStart[li] + 0.4, t - LEAD);
    });
    // cases sans repère : réparties régulièrement
    for (let k = 1; k < starts.length; k++) {
      if (starts[k] !== null) continue;
      let j = k;
      while (j < starts.length && starts[j] === null) j++;
      const a = starts[k - 1];
      const b = j < starts.length ? starts[j] : lineEnd[li];
      for (let m = k; m < j; m++) starts[m] = a + ((b - a) * (m - k + 1)) / (j - k + 1);
    }

    line.panels.forEach((p, k) => {
      const start = starts[k];
      const end = k + 1 < starts.length ? starts[k + 1] : lineEnd[li];
      // instant relatif au début de la case
      const rel = (at) => {
        if (at === undefined || at === null) return 0;
        if (typeof at === 'number') return at;
        const t = wordTime(li, at, start);
        return t === null ? 0 : +(t - start).toFixed(3);
      };
      const resolveEl = (el) => {
        const out = {...el};
        if ('at' in el) out.at = rel(el.at);
        for (const key of ['breakAt', 'tearAt']) if (key in el) out[key] = rel(el[key]);
        if (el.poses) out.poses = el.poses.map(([pose, at]) => ({pose, t: rel(at)}));
        if (el.cycle) out.cycle = {...el.cycle, from: rel(el.cycle.from ?? 0), until: el.cycle.until !== undefined ? rel(el.cycle.until) : null};
        if (el.move) out.move = {...el.move, at: rel(el.move.at ?? 0)};
        if (el.elements) out.elements = el.elements.map(resolveEl);
        if (el.sound && SOUNDS[el.sound]) {
          sfx.push({src: SOUNDS[el.sound], start: +(start + out.at).toFixed(3), volume: VOLUMES[el.sound]});
        }
        return out;
      };
      panels.push({
        ...p,
        line: li,
        start: +start.toFixed(3),
        end: +end.toFixed(3),
        elements: (p.elements || []).map(resolveEl),
        fx: (p.fx || []).map((f) => ({...f, at: rel(f.at)})),
      });
    });
  });

  sfx.sort((a, b) => a.start - b.start);
  const comic = {
    slug,
    title: sb.title,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    duration: +total.toFixed(3),
    durationInFrames: Math.ceil(total * FPS),
    voice: `${slug}/voice.mp3`,
    music: ['mp3', 'wav'].map((e) => `${slug}/music.${e}`).find((f) => fs.existsSync(path.join(publicDir(slug), '..', f))) ?? null,
    musicCuts: [],
    words,
    panels,
    sfx,
  };
  writeJson(path.join(publicDir(slug), 'comic.json'), comic);
  for (const w of warn) console.warn(`⚠ ${w}`);
  const lens = panels.map((p) => p.end - p.start);
  console.log(
    `BD : ${total.toFixed(1)} s, ${panels.length} cases, case moyenne ${(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(2)} s ` +
      `(min ${Math.min(...lens).toFixed(2)}, max ${Math.max(...lens).toFixed(2)}), ${sfx.length} bruitages`,
  );
  return comic;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildComic(getSlug(parseArgs()));
}
