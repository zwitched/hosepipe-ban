from util import *
async def main():
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init()
    await pg.screenshot(path=str(SHOTS/'s_title.png'))
    await tc.tapel('#bPlay');await pg.wait_for_timeout(500)
    await pg.screenshot(path=str(SHOTS/'s_intro.png'))
    await tc.press((200,600));await pg.wait_for_timeout(300)
    await tc.moveto((200,560),steps=5);await pg.wait_for_timeout(500)
    await pg.screenshot(path=str(SHOTS/'s_spray.png'))
    await tc.moveto((150,560),steps=5);await pg.wait_for_timeout(700)
    await pg.screenshot(path=str(SHOTS/'s_spray2.png'))
    await tc.release();print(await st(pg))
    print('ERR',errs);await b.close()
asyncio.run(main())
