import sys
from bot import *
async def main():
  lid=sys.argv[1]
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    i=await E(f"LEVELS.list.findIndex(l=>l.id==='{lid}')");await E(f"GAME.startStreet({i},true)")
    bot=Bot(pg,tc);task=asyncio.create_task(bot.play(timeout=100,log=True))
    while not task.done():
      await pg.wait_for_timeout(3000)
      print(bot.tc.down,bot.tc.pos,await E("(()=>{const S=SIM.S;return [GAME.touchId,S.flowing,S.aimAz.toFixed(3),S.aimEl.toFixed(1),S.t.toFixed(1),S.state,S.water.toFixed(1),S.win?S.win.st:'',S.units.map(u=>u.w.toFixed(2)).join(' ')]})()"))
    print(task.result(),errs);await pg.screenshot(path=str(SHOTS/f'dbg_{lid}.png'));await b.close()
asyncio.run(main())
