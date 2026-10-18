# HOSEPIPE BAN - progress
Concept: top-down dusk garden watering during a hosepipe ban. One finger = hose: hold to run water, slide up/down to raise/lower the nozzle (flat jet vs lob), sideways to swing. Ballistic stream with flight time; long evening shadows show height.
## Done
- sim, render, audio, input; 12 gardens; generator (Heatwave, daily) with reachability check
- menus: title (animated stream), street, heatwave, pause, results, settings
- tests (all touch-driven): slice 30/30, mechanics 28/28, perf 3/3, live 4/4, menus 40/40, input 11/11, layout 92/92, gen 5/5, http 7/7
- bot: skilled wins all 12; sloppy (aim error + slow correction) stars first4=7 vs last4=3, fails No. 23 (tests/last_bot_sloppy.log)
- README, sw.js, manifest, icons, build.py -> dist/index.html
## Next
- DONE: full suite green, skilled bot rerun 12/12, perf 16.6 ms unthrottled, live site verified
- DONE: published https://zwitched.github.io/hosepipe-ban/ ; zip /workspace/hosepipe-ban.zip
