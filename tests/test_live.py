# The published GitHub Pages build: loads on a phone, plays No. 1 to a win with touches.
from bot import *
async def main():
  t=T('live')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'iPhone 13',url='https://zwitched.github.io/hosepipe-ban/');tc=await Touch(pg).init();await fixture(pg)
    t.chk('live site shows the title',await pg.is_visible('#bPlay'))
    await tc.tapel('#bPlay');bot=Bot(pg,tc);x=await bot.play();await pg.wait_for_timeout(1500)
    t.chk('No. 1 won on the live site with touches',x['state']=='won' and await pg.is_visible('#sResult'),x)
    t.chk('service worker active',await pg.evaluate("navigator.serviceWorker.ready.then(()=>true)"))
    await pg.screenshot(path=str(SHOTS/'live_result.png'))
    t.chk('no JS errors',not errs,errs);await b.close()
  t.done([])
asyncio.run(main())
