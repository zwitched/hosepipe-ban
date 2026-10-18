# THE PLAYABLE LOOP through real touches on Pixel 7 and iPhone 13: title -> Start watering -> intro card -> hold to
# water -> slide to aim -> every pot filled -> results with stars -> Next garden -> the next garden starts ->
# one-tap restart. All gameplay input is CDP touch events on the canvas and on-screen buttons.
from bot import *
async def run(p,t,dev,shots):
  b,c,pg,errs=await page(p,dev);tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate;tag=dev.split()[0]
  t.chk(f'[{tag}] title screen with Start button',await pg.is_visible('#sTitle') and await pg.is_visible('#bPlay'))
  if shots:await pg.screenshot(path=str(SHOTS/'01_title.png'))
  t0=await E("performance.now()")
  await tc.tapel('#bPlay');await pg.wait_for_timeout(300)
  x=await st(pg)
  t.chk(f'[{tag}] Start goes straight into No. 1 with the intro card',x['g']=='play' and await pg.is_visible('#intro') and await E("GAME.lv.id")=='no1',x)
  t.chk(f'[{tag}] clock waits for the first touch',x['t']==0 and not x['started'])
  if shots:await pg.screenshot(path=str(SHOTS/'02_intro.png'))
  W,H=await E("[innerWidth,innerHeight]")
  await tc.press((W/2,H*.6));await pg.wait_for_timeout(250);x=await st(pg)
  t.chk(f'[{tag}] holding a finger turns the water on at once',x['flow'] and x['started'] and await E("SIM.live")>5,x)
  t.chk(f'[{tag}] the first touch starts the audio engine',await E("!!AU.ctx&&AU.ctx.state==='running'"))
  t.chk(f'[{tag}] intro card hides on first touch',not await E("document.getElementById('intro').style.opacity==='1'"))
  el0=x['el'];await tc.moveto((W/2,H*.6-60),steps=6);x=await st(pg)
  t.chk(f'[{tag}] sliding up raises the hose',x['el']>el0+8,el0,x['el'])
  az0=x['az'];await tc.moveto((W/2+60,H*.6-60),steps=6);x=await st(pg)
  t.chk(f'[{tag}] sliding right swings the hose right',x['az']>az0+.05,az0,x['az'])
  await tc.release();await pg.wait_for_timeout(120);x=await st(pg)
  t.chk(f'[{tag}] lifting the finger stops the water',not x['flow'])
  ms=(await E("performance.now()"))-t0
  t.chk(f'[{tag}] water flowing within 10 s of tapping Start',ms<10000,round(ms))
  bot=Bot(pg,tc);x=await bot.play()
  t.chk(f'[{tag}] the bot waters every pot in No. 1 using touches',x['state']=='won' and x['done']==x['n'],x)
  await pg.wait_for_timeout(1500)
  t.chk(f'[{tag}] results screen shows',await pg.is_visible('#sResult'))
  r=await E("GAME.lastResult");sv=await E("SV.D.stars.no1")
  t.chk(f'[{tag}] stars awarded and saved',r['won'] and r['stars']>=1 and sv==r['stars'],r,sv)
  if shots:await pg.screenshot(path=str(SHOTS/'03_result.png'))
  await tc.tapel('#bNext');await pg.wait_for_timeout(400)
  t.chk(f'[{tag}] Next garden starts No. 3',await E("GAME.lv.id")=='no3' and (await st(pg))['g']=='play')
  await tc.press((W/2,H*.6));await pg.wait_for_timeout(600);await tc.release();await pg.wait_for_timeout(200)
  w1=(await st(pg))['water']
  await tc.tapel('#bRestart');await pg.wait_for_timeout(150);x=await st(pg)
  t.chk(f'[{tag}] one tap on restart resets the garden instantly (no intro card)',x['t']==0 and x['water']>w1 and x['g']=='play' and not await pg.is_visible('#intro'),x)
  await b.close();return errs
async def main():
  t=T('slice');errs=[]
  async with async_playwright() as p:
    errs+=await run(p,t,'Pixel 7',True)
    errs+=await run(p,t,'iPhone 13',False)
  t.done(errs)
asyncio.run(main())
