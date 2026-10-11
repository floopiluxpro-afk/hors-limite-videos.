// Écrit le découpage plan par plan (videos/<slug>/DECOUPAGE.md) avec timecodes
// réels si la voix existe, estimés sinon.
// Usage : npm run decoupage -- <slug>
import fs from 'node:fs';
import path from 'node:path';
import {displayLine, getSlug, loadStoryboard, parseArgs, publicDir, videoDir} from './lib.mjs';
import {buildTimeline} from './build-timeline.mjs';

const args = parseArgs();
const slug = getSlug(args);
const sb = loadStoryboard(slug);
const real = fs.existsSync(path.join(publicDir(slug), 'words.json'));
const tl = buildTimeline(slug, {estimate: !real});
const tc = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

const FX = {
  none: 'ouverture',
  cut: 'cut sec',
  whip: 'whip pan',
  zoom: 'zoom-in rapide',
  flash: 'flash blanc',
};
const MOTION = {zoomIn: 'zoom lent avant', zoomOut: 'zoom lent arrière', panLeft: 'pano gauche', panRight: 'pano droite', panUp: 'pano haut'};

let md = `# Découpage — ${sb.title}\n\n`;
md += `Durée ${real ? '' : 'estimée '}: **${tl.duration.toFixed(1)} s** · ${sb.lines.reduce((n, l) => n + l.shots.length, 0)} images · ${tl.shots.length} plans à l'écran (les images longues sont recadrées en sous-plans).\n\n`;
md += `**Personnages (références communes à toutes les images)**\n\n`;
for (const c of Object.values(sb.characters || {})) md += `- **${c.name}** : ${c.description}\n`;
md += `\n**Style** : ${sb.style}\n\n`;

sb.lines.forEach((line, li) => {
  const shots = line.shots.map((s) => ({s, parts: tl.shots.filter((x) => x.id.split('.')[0] === s.id)}));
  const start = shots[0].parts[0]?.start ?? 0;
  md += `## ${li + 1}. « ${displayLine(line.text)} »\n`;
  md += `_${tc(start)}_${line.music === 'cut' ? ' · 🔇 musique coupée' : ''}${line.pauseAfter ? ` · silence ${line.pauseAfter}s après` : ''}\n\n`;
  md += `| Plan | Début | Durée | Image | Montage |\n|---|---|---|---|---|\n`;
  for (const {s, parts} of shots) {
    const a = parts[0]?.start ?? 0;
    const b = parts.at(-1)?.end ?? 0;
    const fx = [FX[parts[0]?.transition] ?? parts[0]?.transition, MOTION[s.motion] ?? s.motion];
    if (s.impact === 'hard') fx.push('**ZOOM BRUSQUE + TREMBLEMENT + impact**');
    if (s.impact === 'soft') fx.push('punch-in + léger tremblement');
    if (parts.length > 1) fx.push(`recadré en ${parts.length} sous-plans`);
    const who = (s.characters || []).map((c) => sb.characters[c]?.name).filter(Boolean);
    md += `| ${s.id} | ${tc(a)} | ${(b - a).toFixed(1)} s | ${s.image}${who.length ? ` _(${who.join(', ')})_` : ''} | ${fx.join(' · ')} |\n`;
  }
  if (line.overlays?.length) {
    md += `\nÀ l'écran : ${line.overlays
      .map((o) => {
        if (o.type === 'counter') return `compteur **${o.from} → ${String(o.to).replace('.', ',')}${o.suffix ?? ''}**`;
        if (o.type === 'medals') return `médailles **${o.won}/${o.total}**`;
        if (o.type === 'name') return `carton nom **${o.text}** (${o.subtitle})`;
        if (o.type === 'stamp') return `tampon **${o.text}**`;
        if (o.type === 'logo') return `logo **${o.text}** + bouton **${o.subtitle}**`;
        return `titre **${o.text}**${o.subtitle ? ` (${o.subtitle})` : ''}`;
      })
      .join(' · ')}\n`;
  }
  md += '\n';
});
const file = path.join(videoDir(slug), 'DECOUPAGE.md');
fs.writeFileSync(file, md);
console.log(`Découpage : ${path.relative(process.cwd(), file)}`);
