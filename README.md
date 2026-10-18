# Hosepipe Ban

Larch Close, August. Six weeks without rain and a hosepipe ban. The neighbours are away and you have their keys.
Water their gardens before dark with one hose and one water butt, and don't let anyone see you doing it.

**Play:** https://zwitched.github.io/hosepipe-ban/ (portrait phone; add it to your home screen to play offline)

## How to play
- **Hold** anywhere on the garden to open the tap. **Lift** to stop.
- While holding, **slide up** to raise the nozzle and send the water further, **slide down** to bring it closer.
  Past about halfway up the jet arcs high and drops back in: that's how you get water into hanging baskets and over washing lines.
- **Slide sideways** to swing the hose.
- Each plant has a ring. Fill it past the white mark, then move on before it overflows.
  Water is in the air for most of a second, so let go or move off a moment early.
- The long evening shadow of the stream shows how high it is.
- **JET / SPRAY** (bottom right, once you reach the seedlings): the jet reaches the whole garden but flattens seedlings; the spray is gentle and short.
- The butt (bottom left) is all the water you get. Finish above the dashed line for the third star.
- Restart any garden instantly with the arrow at the top right.

Stars: water everything before dark; nothing overwatered, flattened, soaked or knocked over; finish with water above the line.
You fail if the butt runs dry, it gets dark, or the eye fills up.

## The gardens
Twelve houses on Larch Close, each adding one new thing: pots, a bean row to sweep, hanging baskets, Mrs Gill's
washing, seedlings, wind (watch the windsock), someone watching from over the back fence (let go when the curtain
twitches), a cat that digs up the veg (a squirt sends it off), a greenhouse you can only water through the door,
an apple tree that catches lobs, and then all of them together.

- **Today's garden** (after No. 1): one generated garden per day, the same for everyone on that date.
- **Heatwave** (after No. 5): generated gardens one after another, each a bit worse, until you fail. Best score is kept.

## Run it
No build step and no dependencies. Serve the folder with any static server:

    python3 -m http.server 8000    # then open http://localhost:8000

Or just open `dist/index.html`: it's the whole game in one file and works straight from disk.
`python3 build.py` regenerates `dist/index.html` from the sources.

## Deploy
Copy the folder (or just `dist/index.html`) to any static host. GitHub Pages: push to `main` and serve from the root.

## Tests
Browser tests use Playwright (Python) and drive the game with real CDP touch events on the canvas and buttons:

    pip install playwright && python -m playwright install chromium
    tests/run_all.sh

`tests/bot.py` is a touch-driven player used to prove every garden can be won and to show the difficulty curve.

## Files
`js/sim.js` water and garden simulation, `js/levels.js` gardens and generator, `js/render.js` drawing,
`js/audio.js` synthesised sound, `js/main.js` game flow, input, menus and saving.
