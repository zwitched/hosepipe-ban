from bot import *
async def main():
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    for d in (3,9,15):
      await E(f"GAME.heat={{seed:4242,d:{d},n:{d},score:0}};GAME.startHeat(false)");await pg.wait_for_timeout(300)
      await tc.tap((30,400));await pg.wait_for_timeout(600)
      await pg.screenshot(path=str(SHOTS/f'heat_d{d}.png'))
    await b.close();print(errs)
asyncio.run(main())
