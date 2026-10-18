# HOSEPIPE BAN - progress
Concept: top-down dusk garden watering during a hosepipe ban. One finger = hose: hold to run water, slide up/down to raise/lower the nozzle (flat jet vs lob), sideways to swing. Real ballistic stream with flight time, long evening shadows show height.
## Done
- sim (droplets, collisions: pots, baskets, beds, washing, greenhouse, tree, gnome, cat, window watcher, wind), render, audio, input
- 12 handcrafted gardens, generator (Heatwave, daily) with reachability check
- menus: title (animated stream), street, heatwave, pause, results, settings
- tests: test_slice.py (touch loop, Pixel 7 + iPhone 13) 28/28; bot.py touch bot; shots.py
- sw.js, manifest, icons (tools/icon.py), build.py -> dist/index.html
## Next
- bot results all levels (test_bot.py), tune
- tests: menus, mechanics (wind/window/cat/greenhouse/seedlings/washing), fail paths, layout/safe-area, persistence, audio toggle, perf, http/offline
- README, publish
