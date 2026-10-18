from bot import *
async def main():
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    await pg.wait_for_timeout(2500);await pg.screenshot(path=str(SHOTS/'01_title.png'))
    await E("FIX.stars({no1:3,no3:2,no5:1})");await tc.tapel('#bStreet');await pg.wait_for_timeout(200);await pg.screenshot(path=str(SHOTS/'05_street.png'))
    await tc.tapel('#h-no7');await pg.wait_for_timeout(300);await pg.screenshot(path=str(SHOTS/'02_intro.png'))
    bot=Bot(pg,tc);task=asyncio.create_task(bot.play(timeout=7));await pg.wait_for_timeout(5000);await E("FIX.clock(SIM.S.time*.82)");await pg.wait_for_timeout(1200)
    await pg.screenshot(path=str(SHOTS/'06_dusk.png'));await task
    await E("GAME.startStreet(0,true)");bot=Bot(pg,tc);await bot.play();await pg.wait_for_timeout(1800);await pg.screenshot(path=str(SHOTS/'03_result.png'))
    print(errs);await b.close()
asyncio.run(main())
