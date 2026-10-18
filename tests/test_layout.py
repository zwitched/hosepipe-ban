# Portrait layouts on several phones (and a simulated notch / home-bar safe area): the whole garden is on screen,
# no plant is hidden under the HUD, controls are big enough and don't overlap, menus fit, no page scroll.
from bot import *
DEVS=['iPhone SE','iPhone 13','iPhone 14 Pro Max','Pixel 7','Galaxy S9+',{'viewport':{'width':360,'height':640},'device_scale_factor':2,'is_mobile':True,'has_touch':True}]
HUD=['#bPause','#bRestart','#hudMid','#buttTank','#bNozzle']
RECTS="(sels=>{const o={};for(const s of sels){const r=document.querySelector(s).getBoundingClientRect();o[s]=[r.left,r.top,r.right,r.bottom]}return o})"
async def check(t,pg,tc,E,name):
  W,H=await E("[innerWidth,innerHeight]")
  await E("FIX.stars({no9:1})");await E("GAME.startStreet(0,true)");await pg.wait_for_timeout(200)
  rs=await E(RECTS,HUD);sat=await E("parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0");sab=await E("parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab'))||0")
  t.chk(f'[{name}] HUD controls inside the safe area',all(r[0]>=0 and r[1]>=sat-.5 and r[2]<=W+.5 and r[3]<=H-sab+.5 for r in rs.values()),rs)
  t.chk(f'[{name}] buttons at least 44 px',all((rs[k][2]-rs[k][0])>=44 and (rs[k][3]-rs[k][1])>=44 for k in ['#bPause','#bRestart','#bNozzle']))
  ks=list(rs);ov=[(ks[i],ks[j]) for i in range(len(ks)) for j in range(i+1,len(ks)) if rs[ks[i]][0]<rs[ks[j]][2]-1 and rs[ks[j]][0]<rs[ks[i]][2]-1 and rs[ks[i]][1]<rs[ks[j]][3]-1 and rs[ks[j]][1]<rs[ks[i]][3]-1]
  t.chk(f'[{name}] no HUD controls overlap',not ov,ov)
  g=await E("[RD.toScreen(0,0,0),RD.toScreen(10,17.4,0),RD.toScreen(SIM.S.gx,SIM.S.gy,0)]")
  t.chk(f'[{name}] whole garden on screen',g[0][0]>=0 and g[1][0]<=W and g[1][1]<=H-sab+1 and g[0][1]>=0,g)
  inside=lambda p,r,m=0:r[0]-m<=p[0]<=r[2]+m and r[1]-m<=p[1]<=r[3]+m
  gp=g[2];t.chk(f'[{name}] the gardener is not covered by the HUD',not any(inside(gp,r) for r in rs.values()),gp)
  # every plant in every garden clear of the HUD
  hidden=await E("""(rs=>{const out=[];for(const lv of LEVELS.list){const S=SIM.newLevel(lv);for(const u of S.units){const z=u.k==='basket'?u.z:u.k==='pot'?u.h:0;const [x,y]=RD.toScreen(u.x,u.y,z);
     for(const k in rs){const r=rs[k];if(x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])out.push(lv.id+':'+u.id+':'+k)}}}return out})""",rs)
  t.chk(f'[{name}] no plant in any garden sits under a HUD control',not hidden,hidden)
  await E("GAME.startStreet(6,true)");await pg.wait_for_timeout(150)
  wr=await E("RD.winRect(SIM.S.win.x)");top=rs['#hudMid'][3]
  t.chk(f'[{name}] the watching window over the back fence is visible below the top bar',wr[1]>=top-2 and wr[3]<=H,wr,top)
  t.chk(f'[{name}] no page scroll',await E("document.scrollingElement.scrollHeight<=innerHeight+1&&document.scrollingElement.scrollWidth<=innerWidth+1"))
  for sid,op in (('sPause',"GAME.pause()"),('sSettings',"document.getElementById('bPSettings').click()")):
    await E(op);await pg.wait_for_timeout(100)
    fit=await E(f"(()=>{{const r=document.querySelector('#{sid} .panel').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1}})()")
    t.chk(f'[{name}] {sid} fits',fit)
  await E("GAME.toTitle()");await pg.wait_for_timeout(100)
  t.chk(f'[{name}] title panel fits',await E("(()=>{const r=document.querySelector('.tpanel').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"))
  bot=Bot(pg,tc);await E("GAME.startStreet(0,true)");await bot.play();await pg.wait_for_timeout(1400)
  t.chk(f'[{name}] results panel fits',await E("(()=>{const r=document.querySelector('#sResult .panel').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1})()"))
  if name in('iPhone SE','notch'):await pg.screenshot(path=str(SHOTS/f'layout_{name.replace(" ","_")}.png'))
async def main():
  t=T('layout')
  async with async_playwright() as p:
    for dev in DEVS:
      name=dev if isinstance(dev,str) else '360x640'
      b,c,pg,errs=await page(p,dev);await fixture(pg);E=pg.evaluate;tc=await Touch(pg).init()
      await check(t,pg,tc,E,name)
      if name=='iPhone 13':
        # simulated notch + home bar (env() can't be emulated in Chromium, so set the same CSS variables it feeds)
        await E("document.documentElement.style.setProperty('--sat','47px');document.documentElement.style.setProperty('--sab','34px');RD.resize()")
        await check(t,pg,tc,E,'notch')
        W,H=await E("[innerWidth,innerHeight]")
        await pg.set_viewport_size({'width':H,'height':W});await pg.wait_for_timeout(200)
        t.chk('[iPhone 13] landscape asks to turn the phone upright',await E("getComputedStyle(document.getElementById('rotate')).display")=='flex')
        await pg.set_viewport_size({'width':W,'height':H});await pg.wait_for_timeout(200)
        t.chk('[iPhone 13] after rotating back the canvas matches the screen',await E("RD.W===innerWidth&&RD.H===innerHeight"))
      t.chk(f'[{name}] no JS errors',not errs,errs)
      await b.close()
  t.done([])
asyncio.run(main())
