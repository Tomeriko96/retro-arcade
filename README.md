# Retro Arcade

Kleine klassieke games als installeerbare, offline speelbare PWA. Eén gedeelde shell (manifest, service worker, launcher), losse games ernaast. Geen frameworks, geen build, geen backend.

**Spelen:** https://tomeriko96.github.io/retro-arcade/

## Games

| Game | Bediening |
| --- | --- |
| Breakout | sleep het batje, tik om te lanceren |
| Side Shooter | sleep het schip, het schiet automatisch |

Alle games zijn zelf geschreven (vanilla JS + Canvas), zodat er geen onduidelijke code- of assetlicenties meekomen. Highscores worden per game in `localStorage` bewaard.

## Een game toevoegen

1. Zet `games/<naam>.html` neer (gebruik `games/common.js` voor schaling en highscore).
2. Voeg de game toe aan `GAMES` in `index.html`.
3. Voeg het bestand toe aan `ASSETS` in `sw.js` en verhoog `CACHE` (bijv. `retro-arcade-v2`), anders krijgen bestaande installaties de update niet.

## Lokaal draaien

```bash
python3 -m http.server 8000
```

Service workers werken op `localhost`, dus installeren en offline testen kan zo ook.

## Licentie

MIT, zie `LICENSE`.
