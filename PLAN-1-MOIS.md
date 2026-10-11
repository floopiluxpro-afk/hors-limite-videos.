# Hors Limite — plan de lancement sur 1 mois

20 vidéos, **du lundi au vendredi à 18h30**, du lundi 12 octobre au vendredi 6 novembre 2026.
Chaque script est prêt dans `videos/<dossier>/script.txt`. Pour produire une vidéo :

```bash
npm run storyboard -- <dossier>   # découpage proposé par Gemini
npm run decoupage -- <dossier>    # à relire / valider
npm run make -- <dossier>         # voix + images + captures
npm run render -- <dossier>       # export final
```

Rythme conseillé : produire la semaine suivante pendant le week-end, pour toujours avoir 5 vidéos d'avance.

---

## 1. Configurer le profil

**Nom affiché** : `Hors Limite`
**Pseudo** : `@horslimite` (si pris : `@hors.limite`, `@horslimite.fr`, `@horslimite_tv`)

**Photo de profil** : le logo HORS LIMITE en pâte à modeler (lettres blanches et jaunes, fond rouge foncé), ou un gant de boxe / une ceinture noire en pâte à modeler. Lisible en tout petit : pas de détails fins.

**Bio** (80 caractères maximum) — choisis-en une :

1. `Les histoires les plus folles des sports de combat 🥋🥊`
   `Une anecdote par jour 👇`
2. `Judo, MMA, boxe, muay-thaï 🥋🥊`
   `Les histoires vraies que personne ne raconte`
3. `🥋 Les histoires vraies des sports de combat`
   `📅 Du lundi au vendredi, 18h30`

→ Je recommande la **1** : elle dit le sujet et donne une raison de s'abonner.

**Réglages à faire une fois :**
- Passer en **compte Créateur / Business** (Paramètres → Compte) pour avoir les statistiques.
- **Étiqueter les vidéos comme contenu généré par IA** (option dans « Plus d'options » au moment de publier). Les images et la voix sont générées par IA : TikTok demande de le signaler, et ne pas le faire peut entraîner une baisse de visibilité ou un retrait.
- Lien en bio : inutile au début (et disponible seulement à partir d'un certain nombre d'abonnés).

**Playlists** (onglet du profil, à créer dès que tu as 2 vidéos par thème) : `🥋 Judo`, `🥊 Boxe`, `🔥 MMA / UFC`, `🏛️ Histoire & légendes`.

**Vidéo épinglée** : épingle la meilleure vidéo (celle avec le plus de vues) en haut du profil, à mettre à jour chaque semaine. Au départ, épingle Geesink.

---

## 2. Calendrier

| Date | Vidéo | Sport | Dossier |
|---|---|---|---|
| **Semaine 1** | | | |
| lun. 12/10 | Le géant qui a fait pleurer le Japon (Geesink 1964) | Judo | `geesink-1964` ✅ |
| mar. 13/10 | Champion olympique… après sa mort (Arrhichion) | Pancrace | `arrhichion-champion-mort` |
| mer. 14/10 | 13 secondes pour détrôner un roi (McGregor–Aldo) | MMA | `mcgregor-aldo-13-secondes` |
| jeu. 15/10 | Le combat de 11 h 40 (Klein–Asikainen, 1912) | Lutte | `klein-asikainen-11h40` |
| ven. 16/10 | Le prisonnier qui a gagné sa liberté (Nai Khanom Tom) | Muay-thaï | `nai-khanom-tom` |
| **Semaine 2** | | | |
| lun. 19/10 | Ali contre Inoki : le combat le plus bizarre | Boxe / catch | `ali-inoki-1976` |
| mar. 20/10 | Les ceintures de couleur sont françaises (Kawaishi) | Judo | `kawaishi-ceintures-couleur` |
| mer. 21/10 | Le plus léger a battu tout le monde (Royce Gracie, UFC 1) | MMA / JJB | `royce-gracie-ufc-1` |
| jeu. 22/10 | 110 rounds (Bowen–Burke, 1893) | Boxe | `bowen-burke-110-rounds` |
| ven. 23/10 | Il a refusé de viser la blessure (Yamashita–Rashwan) | Judo | `yamashita-rashwan-fair-play` |
| **Semaine 3** | | | |
| lun. 26/10 | La morsure de Tyson | Boxe | `tyson-holyfield-morsure` |
| mar. 27/10 | Une danse qui cachait un combat (capoeira) | Capoeira | `capoeira-danse-combat` |
| mer. 28/10 | 154 victoires d'affilée (Teddy Riner) | Judo | `riner-154-victoires` |
| jeu. 29/10 | La chute du Dernier Empereur (Fedor–Werdum) | MMA | `fedor-werdum-69-secondes` |
| ven. 30/10 | Le premier yokozuna étranger (Akebono) | Sumo | `akebono-premier-yokozuna-etranger` |
| **Semaine 4** | | | |
| lun. 02/11 | La promesse de Khabib | MMA | `khabib-promesse` |
| mar. 03/11 | La boxe française est née dans la rue (savate) | Savate | `boxe-francaise-savate` |
| mer. 04/11 | Le KO qui a choqué le monde (Holm–Rousey) | MMA | `holm-rousey-ko` |
| jeu. 05/11 | Olympique une seule fois (karaté) | Karaté | `karate-olympique-une-fois` |
| ven. 06/11 | Né dans un temple, avec 9 élèves (Jigoro Kano) | Judo | `kano-naissance-judo` |

Les vidéos les plus « choc » (mort, morsure, KO, 13 secondes) sont réparties pour qu'il y en ait au moins une par semaine.

---

## 3. Textes de publication (légende + hashtags)

Règle : 1 phrase d'accroche + 1 question pour faire commenter + 4 à 5 hashtags. Pas plus : TikTok lit surtout le texte et la voix pour classer la vidéo.

| Vidéo | Légende |
|---|---|
| Geesink | Le jour où le Japon a perdu son propre sport 🥋 Tu connaissais cette histoire ? #judo #jeuxolympiques #histoire #culturegenerale #sportdecombat |
| Arrhichion | Il a gagné… en étant déjà mort 😳 Le pancrace était-il plus dur que le MMA ? #histoire #antiquite #jeuxolympiques #mma #culturegenerale |
| McGregor–Aldo | 13 secondes. Pas une de plus ⏱️ Le KO le plus fou de l'UFC selon toi ? #ufc #mma #mcgregor #ko #sportdecombat |
| Klein–Asikainen | 11 heures et 40 minutes de lutte 🤯 Tu aurais tenu combien de temps ? #lutte #jeuxolympiques #histoire #record #culturegenerale |
| Nai Khanom Tom | Il a gagné sa liberté à coups de coudes 🇹🇭 Le muay-thaï, meilleur art martial debout ? #muaythai #thailande #histoire #legende #sportdecombat |
| Ali–Inoki | Le combat du siècle… allongé sur le dos 🤨 Qui avait raison ? #muhammadali #boxe #catch #mma #histoire |
| Kawaishi | Les ceintures de couleur ? Une idée née à Paris 🇫🇷 C'était quoi ta dernière ceinture ? #judo #ceinturenoire #france #culturegenerale #artmartial |
| Royce Gracie | 80 kilos contre tout le monde 🥋 Le sol, l'arme ultime en combat ? #ufc #jjb #jiujitsu #mma #histoire |
| Bowen–Burke | 110 rounds… pour un match nul 🥊 Le combat le plus long que tu aies vu ? #boxe #record #histoire #culturegenerale #sportdecombat |
| Yamashita–Rashwan | Il aurait pu viser la blessure. Il ne l'a pas fait 🤝 Tu aurais fait pareil ? #judo #fairplay #jeuxolympiques #respect #histoire |
| Tyson–Holyfield | 3 millions de dollars pour une morsure 🦷 Le pire moment de l'histoire de la boxe ? #tyson #boxe #holyfield #histoire #sportdecombat |
| Capoeira | Une danse… qui était un art de combat 🇧🇷 Tu as déjà essayé la capoeira ? #capoeira #bresil #histoire #artmartial #culturegenerale |
| Riner | 154 victoires sans perdre une seule fois 🇫🇷 Le plus grand judoka de l'histoire ? #teddyriner #judo #france #record #sportdecombat |
| Fedor–Werdum | 10 ans invaincu… battu en 69 secondes 😱 Fedor, meilleur poids lourd de tous les temps ? #fedor #mma #jjb #histoire #sportdecombat |
| Akebono | Le premier étranger au sommet du sumo 🇯🇵 Tu tiendrais une semaine dans une écurie de sumo ? #sumo #japon #histoire #record #culturegenerale |
| Khabib | 29-0. Puis il a tenu sa promesse 🤍 Le plus grand de l'histoire de l'UFC ? #khabib #ufc #mma #respect #sportdecombat |
| Savate | La boxe française est née dans la rue 🇫🇷 Tu connaissais la savate ? #boxefrancaise #savate #france #histoire #sportdecombat |
| Holm–Rousey | Le KO que personne n'avait vu venir 🦵 La plus grosse surprise de l'UFC ? #ufc #mma #rondarousey #ko #sportdecombat |
| Karaté | Olympique une seule fois… et puis plus rien 🥋 Le karaté doit-il revenir aux JO ? #karate #jeuxolympiques #france #artmartial #sportdecombat |
| Jigoro Kano | Le judo est né avec 9 élèves 🏯 Tu fais quel sport de combat ? #judo #japon #histoire #artmartial #culturegenerale |

---

## 4. Routine de publication

**Avant de publier**
- Couverture : choisis l'image la plus forte (souvent le moment fort) et ajoute un titre court dans TikTok (« Il a gagné… mort », « 110 rounds »).
- Coche l'étiquette **contenu généré par IA**.
- Musique : la vidéo a déjà sa propre musique, n'ajoute pas de son TikTok par-dessus.

**Dans l'heure qui suit** (c'est là que TikTok décide de pousser ou non)
- Réponds aux premiers commentaires, surtout aux questions et aux désaccords.
- Si quelqu'un corrige un fait : remercie et vérifie. Une bonne correction peut devenir une vidéo (« Vous m'avez repris sur… »).

**Chaque dimanche (15 min)** : regarde dans les statistiques
- le **taux de visionnage complet** et la **durée moyenne de visionnage** : si les gens partent avant 3 s, c'est l'accroche (première phrase) qu'il faut changer ;
- les sujets qui marchent le mieux → fais-en plus la semaine suivante ;
- l'heure où tes abonnés sont en ligne (onglet Abonnés) → ajuste les 18h30 si besoin.

**Objectifs réalistes pour le 1er mois** : ne pas juger avant ~15 vidéos. Les premières vidéos d'un nouveau compte font souvent peu de vues ; c'est la régularité qui compte.

---

## 5. Points d'attention

- **Monétisation** : le Programme de récompenses des créateurs de TikTok demande, aux dernières règles que je connais, des vidéos de **plus d'1 minute**, 10 000 abonnés et 100 000 vues sur 30 jours. Les vidéos font 45-60 s : quand tu approcheras de ces seuils, passe à 61-70 s (scripts un peu plus longs). Vérifie les conditions actuelles dans l'appli.
- **ElevenLabs** : pour un usage commercial (monétisation), il faut un **abonnement payant** ElevenLabs ; l'offre gratuite ne l'autorise pas.
- **Faits** : les scripts s'en tiennent aux faits les plus documentés ; les histoires légendaires (Nai Khanom Tom, Arrhichion) sont présentées comme « selon la légende / les récits antiques ». Garde ce réflexe : c'est ce qui rend un compte de culture G crédible.
- **Violence** : TikTok limite la portée des contenus violents ou sanglants. Le style pâte à modeler aide ; évite le sang et les blessures en gros plan dans les images (la morsure de Tyson : montrer la réaction, pas l'oreille).

---

## 6. Idées pour le mois suivant

Mike Tyson champion à 20 ans · Le premier combat d'Ali contre Liston · Shozo Fujii et les 4 titres mondiaux · Bruce Lee et le « one inch punch » · La création du MMA au Brésil (vale tudo) · Le karatéka qui a cassé des cornes de taureau (Mas Oyama) · Rocky Marciano 49-0 · Mayweather 50-0 · Clarisse Agbégnénou · Saenchai · Jon Jones · Georges St-Pierre · Le sumo et le sel · Pourquoi les judokas saluent · L'origine du mot « knock-out ».
