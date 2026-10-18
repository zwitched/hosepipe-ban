# Every menu button, pressed with a finger. Persistence of progress and settings across reloads. Daily garden is the
# same on every load of the same date. Heatwave chains gardens and keeps a best score.
from bot import *
IDS=['no1','no3','no5','no7','no9','no11','no13','no15','no17','no19','no21','no23']
async def main():
  t=T('menus')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
    vis=lambda s:pg.is_visible(s)
    t.chk('fresh save: Heatwave and Today\'s garden are locked',await E("document.getElementById('bHeat').disabled&&document.getElementById('bDaily').disabled"))
    await tc.tapel('#bStreet');t.chk('The Close opens the street list',await vis('#sStreet') and await E("document.querySelectorAll('.house').length")==12)
    t.chk('only No. 1 unlocked at first',await E("[...document.querySelectorAll('.house')].filter(h=>!h.classList.contains('locked')).length")==1)
    await tc.tapel('#h-no3');t.chk('tapping a locked house does nothing',await vis('#sStreet'))
    await tc.tapel('#sStreet .back');t.chk('back returns to the title',await vis('#sTitle'))
    await tc.tapel('#bSettings');t.chk('Settings opens',await vis('#sSettings'))
    await tc.tapel('#optSound + i');await tc.tapel('#optVib + i');await tc.tapel('#optLeft + i')
    sl=await tc.center('#optSens');await tc.tap((sl[0]+sl[2]*0.45,sl[1]))
    o=await E("SV.D.opt");t.chk('settings toggles change sound/vibration/left-handed and aim speed',o['sound']==False and o['vib']==False and o['left']==True and o['sens']>1.3,o)
    t.chk('sound off reaches the audio engine',await E("AU.on")==False)
    await tc.tapel('#bSetBack');t.chk('settings back returns to title',await vis('#sTitle'))
    await pg.reload();await pg.wait_for_timeout(500);await fixture(pg)
    o2=await E("SV.D.opt");t.chk('settings persist after reload',o2==o and await E("AU.on")==False and await E("document.body.classList.contains('left')"),o2)
    # left-handed layout swaps nozzle and butt
    await E("FIX.stars({no9:1})");await tc.tapel('#bPlay');await pg.wait_for_timeout(300)
    nz=await tc.center('#bNozzle');bt=await tc.center('#buttTank');W=await E("innerWidth")
    t.chk('left-handed: nozzle button on the left, water butt on the right',nz[0]<W/2<bt[0],nz,bt)
    # pause menu
    await tc.tapel('#bPause');t.chk('pause button opens the pause menu',await vis('#sPause') and (await st(pg))['g']=='paused')
    tt=(await st(pg))['t'];await pg.wait_for_timeout(500);t.chk('time stops while paused',(await st(pg))['t']==tt)
    await tc.tapel('#bResume');t.chk('Carry on resumes',(await st(pg))['g']=='play' and not await vis('#sPause'))
    await tc.press((200,500));await pg.wait_for_timeout(500);await tc.release();await tc.tapel('#bPause');await tc.tapel('#bPRestart');x=await st(pg)
    t.chk('pause > Start again restarts the garden',x['g']=='play' and x['t']==0 and x['water']==await E("SIM.S.cap"))
    await tc.tapel('#bPause');await tc.tapel('#bPSettings');t.chk('pause > Settings opens settings',await vis('#sSettings'))
    await tc.tapel('#bSetBack');t.chk('settings back returns to pause',await vis('#sPause'))
    await tc.tapel('#bQuit');t.chk('pause > Back to the Close shows the street',await vis('#sStreet'))
    await tc.tapel('#sStreet .back')
    # win No. 1 with the bot -> unlocks
    await E("localStorage.removeItem('hosepipeban.v1');SV.load()");await pg.reload();await pg.wait_for_timeout(400);await fixture(pg)
    await tc.tapel('#bPlay');bot=Bot(pg,tc);x=await bot.play();await pg.wait_for_timeout(1400)
    t.chk('result: Next garden / Try again / The Close buttons all visible',all([await vis('#bNext'),await vis('#bAgain'),await vis('#bResMenu')]))
    await tc.tapel('#bResMenu');t.chk('The Close button on results goes to the street',await vis('#sStreet'))
    t.chk('winning No. 1 unlocks No. 3',await E("!document.getElementById('h-no3').classList.contains('locked')"))
    await tc.tapel('#h-no3');t.chk('tapping an unlocked house starts it',await E("GAME.lv.id")=='no3')
    await tc.tapel('#bPause');await tc.tapel('#bQuit');await tc.tapel('#sStreet .back')
    t.chk("winning No. 1 unlocks Today's garden",not await E("document.getElementById('bDaily').disabled"))
    await pg.reload();await pg.wait_for_timeout(400);await fixture(pg)
    t.chk('stars persist after reload',await E("SV.D.stars.no1")>=1)
    # daily garden: reproducible
    await tc.tapel('#bDaily');d1=await E("JSON.stringify({p:GAME.lv.pots,b:GAME.lv.beds,w:GAME.lv.wash,g:GAME.lv.gh})")
    t.chk("Today's garden starts",await E("GAME.mode")=='daily' and (await st(pg))['g']=='play')
    await pg.reload();await pg.wait_for_timeout(400);await fixture(pg)
    await tc.tapel('#bDaily');d2=await E("JSON.stringify({p:GAME.lv.pots,b:GAME.lv.beds,w:GAME.lv.wash,g:GAME.lv.gh})")
    t.chk("Today's garden is identical after a reload (seeded by date)",d1==d2)
    other=await E("JSON.stringify((l=>({p:l.pots,b:l.beds}))(LEVELS.gen(U.hash('daily2001-01-01'),7)))")
    t.chk('a different date gives a different garden',other!=d1)
    t.chk("today's garden passed the reachability check",await E("LEVELS.reachable(GAME.lv).length")==0)
    await E("GAME.startDaily(true)")  # LEVELS.reachable() rebuilt the sim; restart the garden
    bot=Bot(pg,tc);x=await bot.play(timeout=150);await pg.wait_for_timeout(1500)
    t.chk("the bot can win today's garden",x['state']=='won',x)
    t.chk("today's best is saved",await E("(SV.D.daily[U.today()]||{}).stars||0")>=1)
    await tc.tapel('#bResMenu');await tc.tapel('#sStreet .back')
    # heatwave
    await E("FIX.stars({no3:1,no5:1})");await E("GAME.toTitle()");await pg.wait_for_timeout(100)
    t.chk('Heatwave unlocks after No. 5',not await E("document.getElementById('bHeat').disabled"))
    await tc.tapel('#bHeat');t.chk('Heatwave screen',await vis('#sHeat'))
    await tc.tapel('#bHeatGo');t.chk('Heatwave run starts at garden 1',await E("GAME.mode")=='heat' and await E("GAME.heat.n")==1)
    bot=Bot(pg,tc);x=await bot.play(timeout=150);await pg.wait_for_timeout(1500)
    sc=await E("GAME.heat.score");t.chk('winning a Heatwave garden adds to the score',x['state']=='won' and sc>0,sc)
    await tc.tapel('#bNext');t.chk('Next garden continues the run at garden 2 with a new layout',await E("GAME.heat.n")==2 and (await st(pg))['g']=='play')
    # lose on purpose: empty the butt
    await bot.steer(0,-10)
    for i in range(600):
      x=await st(pg)
      if x['state']!='play':break
      await pg.wait_for_timeout(100)
    await tc.release();await pg.wait_for_timeout(1500)
    t.chk('losing ends the run and records the best score',await vis('#sResult') and await E("SV.D.heat.best")==sc and 'Run over' in await pg.inner_text('#rWhy'),await E("SV.D.heat"))
    await tc.tapel('#bNext');t.chk('New run starts again at garden 1, score 0',await E("GAME.heat.n")==1 and await E("GAME.heat.score")==0)
    # reset progress
    await tc.tapel('#bPause');await tc.tapel('#bQuit');await tc.tapel('#sStreet .back');await tc.tapel('#bSettings');op=await E("JSON.stringify(SV.D.opt)");await tc.tapel('#bReset')
    t.chk('Clear progress asks for a second tap',await E("Object.keys(SV.D.stars).length")>0 and 'again' in await pg.inner_text('#bReset'))
    await tc.tapel('#bReset');t.chk('second tap clears progress but keeps settings',await E("Object.keys(SV.D.stars).length")==0 and await E("JSON.stringify(SV.D.opt)")==op)
    t.chk('no JS errors',not errs,errs)
    await b.close()
  t.done([])
asyncio.run(main())
