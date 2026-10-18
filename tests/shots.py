# Screenshots of every garden mid-play (bot watering through touches), for art review.
import sys
from bot import *
async def main():
  ids=sys.argv[1:] or [l for l in ['no1','no3','no5','no7','no9','no11','no13','no15','no17','no19','no21','no23']]
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'iPhone 13');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    await E("FIX.stars({no1:3,no3:3,no5:3,no7:3,no9:3,no11:3,no13:3,no15:3,no17:3,no19:3,no21:3,no23:3})")
    for lid in ids:
      i=await E(f"LEVELS.list.findIndex(l=>l.id==='{lid}')")
      await E(f"GAME.startStreet({i})");await pg.wait_for_timeout(200)
      if lid=='no1':await pg.screenshot(path=str(SHOTS/f'g_{lid}_intro.png'))
      bot=Bot(pg,tc)
      task=asyncio.create_task(bot.play(timeout=6))
      await pg.wait_for_timeout(4500)
      await pg.screenshot(path=str(SHOTS/f'g_{lid}.png'))
      await task
    print('ERR',errs);await b.close()
asyncio.run(main())
