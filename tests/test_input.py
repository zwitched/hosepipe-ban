# Interrupted and unusual input: touch cancel, a second finger, app backgrounded, resize mid-spray, desktop mouse.
from bot import *
async def main():
  t=T('input')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    await tc.tapel('#bPlay');await pg.wait_for_timeout(200)
    await tc.press((200,500));await pg.wait_for_timeout(200);t.chk('water on while held',(await st(pg))['flow'])
    await tc.send('touchCancel',[]);tc.down=False;await pg.wait_for_timeout(100)
    t.chk('a cancelled touch (system gesture, call) turns the water off',not (await st(pg))['flow'])
    await tc.press((200,500));await pg.wait_for_timeout(100);x0=await st(pg)
    await tc.send('touchStart',[(0,(200,500)),(1,(300,300))]);await pg.wait_for_timeout(30)
    for k in range(6):
      await tc.send('touchMove',[(0,(200,500)),(1,(300,300-k*20))]);await pg.wait_for_timeout(16)
    x1=await st(pg);t.chk('a second finger does not move the hose',abs(x1['el']-x0['el'])<.01 and abs(x1['az']-x0['az'])<.001,x0['el'],x1['el'])
    await tc.send('touchEnd',[]);tc.down=False;await pg.wait_for_timeout(100)
    t.chk('lifting both fingers turns the water off',not (await st(pg))['flow'])
    await tc.press((200,500));await pg.wait_for_timeout(150)
    await E("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    await pg.wait_for_timeout(100);x=await st(pg)
    t.chk('switching away from the app pauses the game and stops the water',x['g']=='paused' and not x['flow'] and await pg.is_visible('#sPause'))
    await E("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
    await tc.send('touchEnd',[]);tc.down=False
    t.chk('coming back stays paused until Carry on',(await st(pg))['g']=='paused')
    await tc.tapel('#bResume')
    await tc.press((200,500));await pg.wait_for_timeout(150)
    await pg.set_viewport_size({'width':360,'height':700});await pg.wait_for_timeout(250)
    await tc.moveto((200,440));x=await st(pg)
    t.chk('resizing mid-game keeps the game running and the canvas fits',x['g']=='play' and await E("RD.W===360&&RD.H===700"))
    await tc.release()
    await b.close()
    # desktop: mouse only
    b,c,pg,errs2=await page(p,{'viewport':{'width':1280,'height':800}});E=pg.evaluate
    await pg.click('#bPlay');await pg.wait_for_timeout(200)
    await pg.mouse.move(640,500);await pg.mouse.down();await pg.wait_for_timeout(200);x0=await st(pg)
    await pg.mouse.move(640,420,steps=6);x1=await st(pg)
    t.chk('desktop mouse: hold to water, drag up raises the hose',x0['flow'] and x1['el']>x0['el']+5,x0['el'],x1['el'])
    await pg.mouse.up();await pg.wait_for_timeout(50);t.chk('mouse up stops the water',not (await st(pg))['flow'])
    t.chk('desktop: garden fits the window',await E("(()=>{const a=RD.toScreen(0,0,0),b=RD.toScreen(10,17.4,0);return a[0]>=0&&b[0]<=innerWidth&&b[1]<=innerHeight&&a[1]>=0})()"))
    await b.close()
    t.chk('no JS errors',not errs and not errs2,errs,errs2)
  t.done([])
asyncio.run(main())
