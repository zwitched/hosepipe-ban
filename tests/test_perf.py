# Frame pacing while the stream is running in the busiest garden, on a 4x CPU-throttled Pixel 7 emulation.
from bot import *
async def main():
  t=T('perf')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    cdp=await pg.context.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    await E("FIX.stars({no21:1})");await E("GAME.startStreet(11,true)");await pg.wait_for_timeout(300)
    async def sweep():
      await tc.press((200,520))
      for k in range(16):
        await tc.moveto((120+(k%4)*50,440+(k%3)*60),steps=10,dt=30)
      await tc.release()
    task=asyncio.create_task(sweep())
    await pg.wait_for_timeout(1500)
    await E("window.__ft=[];(function f(t){if(window.__last)__ft.push(t-__last);window.__last=t;if(__ft.length<300)requestAnimationFrame(f)})(performance.now())")
    await pg.wait_for_timeout(6500);await task
    ft=sorted(await E("__ft"));live=await E("SIM.live");js=await E("window.__js||null")
    avg=sum(ft)/len(ft);p95=ft[int(len(ft)*.95)]
    print('frames',len(ft),'avg ms',round(avg,2),'p95 ms',round(p95,2),'js',js)
    t.chk('4x throttled: average frame under 20 ms (50+ fps)',avg<20,round(avg,2))
    t.chk('4x throttled: 95th percentile under 34 ms',p95<34,round(p95,2))
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
    t.chk('no JS errors',not errs,errs)
    await b.close()
  t.done([])
asyncio.run(main())
