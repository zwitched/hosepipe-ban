# Each mechanic exercised with real touches on the canvas (the bot's steer() only moves a finger).
from bot import *
IDS=['no1','no3','no5','no7','no9','no11','no13','no15','no17','no19','no21','no23']
async def start(pg,lid):
  await pg.evaluate(f"GAME.startStreet({IDS.index(lid)},true)");await pg.wait_for_timeout(150)
async def hold_at(bot,az,el,ms):
  await bot.steer(az,el);await bot.pg.wait_for_timeout(ms)
async def main():
  t=T('mechanics')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    await E("FIX.stars({%s})"%','.join(f'{i}:1' for i in IDS))
    U_=lambda i:E(f"(()=>{{const u=SIM.S.units[{i}];return {{w:u.w,done:u.done,sog:u.sog,flat:u.flat}}}})()")
    # --- basic fill + overwatering (No. 1)
    await start(pg,'no1');bot=Bot(pg,tc)
    a=await E("BOT.aim(0,'jet')");await hold_at(bot,a[0],a[1],1200);u=await U_(0)
    t.chk('holding the stream on a pot fills it',u['w']>0.3,u)
    await pg.wait_for_timeout(2600);u=await U_(0)
    t.chk('keep holding past the band and it overflows (Too much)',u['sog'] and u['done'],u)
    await tc.release();await pg.wait_for_timeout(300)
    # --- hanging baskets need a lob (No. 5)
    await start(pg,'no5');bot=Bot(pg,tc)
    flat=await E("(()=>{const u=SIM.S.units.find(u=>u.k==='basket');for(let el=-10;el<14;el+=.5){for(let az=-1;az<1;az+=.01){const h=SIM.trace(az,el,'jet');if(h.type==='basketbase'||(h.type==='ground'&&Math.hypot(h.x-u.x,h.y-u.y)<1.2))return [az,el,u.id]}}return null})()")
    await hold_at(bot,flat[0],flat[1],1500);u=await U_(flat[2])
    t.chk('a flat shot passes under a hanging basket without filling it',u['w']<0.05,flat,u)
    a=await E(f"BOT.aim({flat[2]},'jet')");await hold_at(bot,a[0],a[1],1200);u=await U_(flat[2])
    t.chk('a higher shot drops into the basket',u['w']>0.3,a,u)
    await tc.release()
    # --- washing line (No. 7)
    await start(pg,'no7');bot=Bot(pg,tc)
    w=await E("(()=>{for(let el=4;el<30;el+=.5){for(let az=-.4;az<.4;az+=.01){const h=SIM.trace(az,el,'jet');if(h.type==='wash')return [az,el]}}return null})()")
    await hold_at(bot,w[0],w[1],1800);x=await st(pg)
    t.chk('a flat shot into the washing soaks it',x['soaked']>=1,w,x['soaked'])
    a=await E("BOT.aim(0,'jet')");await hold_at(bot,a[0],a[1],1500);u=await U_(0)
    t.chk('lobbing over the line waters the roses behind it',u['w']>0.3,a,u)
    gn=await E("(()=>{const g=SIM.S.gnomes[0];for(let el=-14;el<40;el+=.5){for(let az=-1;az<1;az+=.01){const h=SIM.trace(az,el,'jet');if(h.type==='gnome'&&h.ref===g)return [az,el]}}return null})()")
    await hold_at(bot,gn[0],gn[1],1200)
    t.chk('the jet knocks a gnome over',await E("SIM.S.gnomes[0].down"))
    await tc.release()
    # --- seedlings: jet flattens, spray doesn't (No. 9)
    await start(pg,'no9');bot=Bot(pg,tc)
    fr=await E("SIM.S.units.filter(u=>u.fragile).map(u=>u.id)")
    a=await E(f"BOT.aim({fr[0]},'jet')");await hold_at(bot,a[0],a[1],1500);u=await U_(fr[0])
    t.chk('the jet flattens seedlings',u['flat'],u)
    await tc.release();await tc.tapel('#bNozzle');x=await st(pg)
    t.chk('tapping the nozzle button switches to SPRAY',x['mode']=='spray' and 'SPRAY' in await pg.inner_text('#bNozzle'))
    a=await E(f"BOT.aim({fr[1]},'spray')");await hold_at(bot,a[0],a[1],1800);u=await U_(fr[1])
    t.chk('the spray waters seedlings without flattening them',u['w']>0.4 and not u['flat'],u)
    far=await E("SIM.range(SIM.S.aimEl,'spray')")
    t.chk('the spray only reaches close by (< 6.5 m)',await E("Math.max(...Array.from({length:90},(_,i)=>SIM.range(-14+i,'spray')))")<6.5)
    await tc.release();await tc.tapel('#bNozzle')
    t.chk('tap again for JET',(await st(pg))['mode']=='jet')
    # --- wind (No. 11): aiming as if calm misses downwind; aiming upwind hits
    await start(pg,'no11');bot=Bot(pg,tc)
    await tc.press((200,500));await pg.wait_for_timeout(100);await tc.release()
    wnd=await E("SIM.S.wind.x");pid=await E("SIM.S.units.findIndex(u=>u.k==='pot')")
    calm=await E(f"(()=>{{const u=SIM.S.units[{pid}];let best=null;for(let el=-5;el<40;el+=.5){{for(let az=-1;az<1;az+=.005){{const h=SIM.trace(az,el,'jet');if(h.type==='unit'&&h.ref===u){{const d=Math.hypot(h.x-u.x,h.y-u.y);if(!best||d<best[2])best=[az,el,d]}}}}}}return best}})()")
    w0=(await U_(pid))['w'];await hold_at(bot,calm[0],calm[1],1500);w1=(await U_(pid))['w']
    await tc.release();await pg.wait_for_timeout(800)
    a=await E(f"BOT.aim({pid},'jet')");w2=(await U_(pid))['w'];await hold_at(bot,a[0],a[1],1500);w3=(await U_(pid))['w']
    t.chk('wind blows the stream: aiming upwind fills the pot much better than aiming as if calm',abs(wnd)>1 and (w3-w2)>(w1-w0)*1.5+0.1,wnd,round(w1-w0,2),round(w3-w2,2))
    await tc.release()
    # --- the window (No. 13): spraying while watched fills the eye and gets you caught
    await start(pg,'no13');bot=Bot(pg,tc)
    await tc.press((200,500))
    for i in range(140):
      if await E("SIM.S.win.st")=='twitch':break
      await pg.wait_for_timeout(100)
    t.chk('the curtain twitches as a warning before they look',await E("SIM.S.win.st")=='twitch' and await E("document.getElementById('watch').classList.contains('warn')"))
    await tc.release()
    for i in range(40):
      if await E("SIM.S.win.st")=='watch':break
      await pg.wait_for_timeout(50)
    s0=(await st(pg))['susp'];await pg.wait_for_timeout(600);s1=(await st(pg))['susp']
    t.chk('not spraying while watched: the eye does not fill',s1<=s0+1e-6,s0,s1)
    await tc.press((200,500));await pg.wait_for_timeout(700);s2=(await st(pg))['susp']
    t.chk('spraying while watched fills the eye',s2>s1+0.15,s2)
    for i in range(60):
      x=await st(pg)
      if x['state']!='play' or await E("SIM.S.win.st")!='watch':break
      await pg.wait_for_timeout(100)
    # keep spraying through the next watch until caught
    for i in range(300):
      x=await st(pg)
      if x['state']!='play':break
      await pg.wait_for_timeout(100)
    await tc.release();await pg.wait_for_timeout(1500)
    t.chk('keep spraying while watched and you get Spotted',x['why']=='caught' and await pg.is_visible('#sResult') and 'Spotted' in await pg.inner_text('#rTitle'),x)
    await tc.tapel('#bResMenu')
    # --- cat (No. 15)
    await start(pg,'no15');bot=Bot(pg,tc);await tc.tap((20,300))
    for i in range(160):
      if await E("SIM.S.cat.st")=='dig':break
      await pg.wait_for_timeout(100)
    cu=await E("SIM.S.cat.u.id");await pg.wait_for_timeout(200)
    t.chk('the cat comes over the fence and digs a bed',await E("SIM.S.cat.st")=='dig')
    cat=await E("[SIM.S.cat.x,SIM.S.cat.y]");a=await E(f"BOT.aimPt({cat[0]},{cat[1]},'jet')")
    await bot.steer(a[0],a[1])
    for i in range(30):
      if await E("SIM.S.cat.st")=='flee':break
      await pg.wait_for_timeout(50)
    t.chk('a squirt sends the cat running',await E("SIM.S.cat.st") in ('flee','away'))
    await tc.release()
    # watered bed gets dug up
    await start(pg,'no15');await E("SIM.S.units.forEach(u=>{u.w=1.1;u.done=true});SIM.S.seqDone=SIM.S.units.length-0;SIM.S.units[0].w=0;SIM.S.units[0].done=false") # fixture: pre-watered beds
    await tc.tap((20,300))
    for i in range(200):
      if await E("SIM.S.cat.st")=='dig':break
      await pg.wait_for_timeout(100)
    await pg.wait_for_timeout(1500)
    t.chk('a digging cat drains the bed it sits on',await E("SIM.S.cat.u.w<1.1"),await E("SIM.S.cat.u.w"))
    # --- greenhouse (No. 17)
    await start(pg,'no17');bot=Bot(pg,tc)
    lob=await E("(()=>{const q=SIM.S.gh;for(let el=50;el<78;el+=.5){for(let az=-1;az<.2;az+=.01){const h=SIM.trace(az,el,'jet');if(h.type==='glass'&&h.x>q.x0+1&&h.x<q.x1-1&&h.y>q.y0+1&&h.y<q.y1-1)return [az,el]}}return null})()")
    await hold_at(bot,lob[0],lob[1],1200)
    t.chk('a lob onto the greenhouse roof is stopped by the glass',all(not u for u in await E("SIM.S.units.filter(u=>u.plant==='tomato').map(u=>u.w>0.02)")))
    a=await E("BOT.aim(0,'jet')");await hold_at(bot,a[0],a[1],1500);u=await U_(0)
    t.chk('a low shot through the door waters a tomato',u['w']>0.12,a,u)
    await tc.release()
    # --- tree (No. 19)
    await start(pg,'no19');bot=Bot(pg,tc)
    tr=await E("(()=>{for(let el=40;el<78;el+=.5){for(let az=-.3;az<.3;az+=.01){const h=SIM.trace(az,el,'jet');if(h.type==='tree')return [az,el]}}return null})()")
    w0=await E("SIM.S.wasted");await hold_at(bot,tr[0],tr[1],1200);w1=await E("SIM.S.wasted")
    t.chk('the apple tree catches lobbed water',w1-w0>0.5 and await E("SIM.S.units.filter(u=>u.plant==='lettuce').every(u=>u.w<0.05)"),w1-w0)
    a=await E("BOT.aim(0,'jet')");await hold_at(bot,a[0],a[1],1400);u=await U_(0)
    t.chk('a flat shot under the canopy waters the lettuce',u['w']>0.12,u)
    await tc.release()
    # --- failure: out of water (No. 1), all through touch
    await start(pg,'no1');bot=Bot(pg,tc);await bot.steer(0,-10)
    for i in range(400):
      x=await st(pg)
      if x['state']!='play':break
      await pg.wait_for_timeout(100)
    await tc.release();await pg.wait_for_timeout(1500)
    t.chk('emptying the water butt on the patio fails with Out of water',x['why']=='dry' and 'Out of water' in await pg.inner_text('#rTitle'),x)
    await tc.tapel('#bAgain');await pg.wait_for_timeout(200);x=await st(pg)
    t.chk('Try again restarts with a full butt',x['g']=='play' and x['water']>10 and x['t']==0,x)
    # --- failure: dark (fixture moves the clock to 1 s before dusk; waiting 80 s would test nothing extra)
    await tc.press((200,500));await pg.wait_for_timeout(100);await tc.release();await E("FIX.clock(SIM.S.time-1)");await pg.wait_for_timeout(2600)
    t.chk('running out of daylight fails with Too dark',(await st(pg))['why']=='dark' and 'Too dark' in await pg.inner_text('#rTitle'))
    t.chk('no JS errors',not errs,errs)
    await b.close()
  t.done([])
asyncio.run(main())
