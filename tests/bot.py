# A touch-driven player. It decides where to aim with read-only solvers (tests/fixture.js) and then plays ONLY through
# CDP touch events on the canvas and the on-screen nozzle button, exactly like a person's finger.
import random
from util import *
FIXJS=(ROOT/'tests/fixture.js').read_text()
async def fixture(pg):await pg.add_script_tag(content=FIXJS)
class Bot:
  def __init__(s,pg,tc,noise=0.0,react=0.0,seed=1,lead=0.8):
    s.lead=lead
    s.pg=pg;s.tc=tc;s.noise=noise;s.react=react;s.r=random.Random(seed);s.anchor=None;s.E=pg.evaluate
  async def geo(s):
    return await s.E("({s:RD.s,W:innerWidth,H:innerHeight,sens:SV.D.opt.sens,R:SIM.range(SIM.S.aimEl,SIM.S.mode)})")
  async def ensure_down(s):
    if not s.tc.down:
      g=await s.geo();s.anchor=(g['W']*0.5,g['H']*0.55);await s.tc.press(s.anchor);await s.pg.wait_for_timeout(16)
  async def steer(s,az,el,hold=True):
    # move the finger until the aim matches; regrip when the finger would leave the screen
    if hold:await s.ensure_down()
    for it in range(10):
      x=await st(s.pg);g=await s.geo()
      daz=az-x['az'];de=el-x['el']
      if abs(daz)<0.006 and abs(de)<0.3:return True
      dx=daz*max(2.2,g['R'])*g['s']/(1.05*g['sens']);dy=-de*g['s']/(6*g['sens'])
      await s.ensure_down();px,py=s.tc.pos;tx,ty=px+dx,py+dy
      if not(20<tx<g['W']-20 and 90<ty<g['H']-20):
        await s.tc.release();await s.pg.wait_for_timeout(10)
        nx=min(max(g['W']/2-dx/2,30),g['W']-30);ny=min(max(g['H']*.55-dy/2,100),g['H']-30)
        await s.tc.press((nx,ny));tx,ty=nx+dx,ny+dy
        tx=min(max(tx,10),g['W']-10);ty=min(max(ty,60),g['H']-10)
      await s.tc.moveto((tx,ty),steps=max(2,int(math.hypot(dx,dy)/25)),dt=16)
    return False
  async def mode(s,m):
    x=await st(s.pg)
    if x['mode']!=m:
      if s.tc.down:await s.tc.release()
      await s.tc.tapel('#bNozzle');await s.pg.wait_for_timeout(30)
  async def play(s,timeout=140,log=False):
    t0=await s.E("performance.now()")
    while True:
      x=await st(s.pg)
      if x['state']!='play' or x['g']!='play':break
      if (await s.E("performance.now()"))-t0>timeout*1000:break
      w=await s.E("SIM.S.win?SIM.S.win.st:''")
      if w in('watch','twitch'):
        if s.tc.down:await s.tc.release()
        await s.pg.wait_for_timeout(100);continue
      cat=await s.E("(()=>{const c=SIM.S.cat;return c&&(c.st==='dig'||c.st==='walk')&&c.x>0.3&&c.x<9.7?[c.x,c.y]:null})()")
      if cat:
        await s.mode('jet');a=await s.E(f"BOT.aimPt({cat[0]},{cat[1]},'jet')")
        if a:
          await s.steer(a[0],a[1]);await s.pg.wait_for_timeout(250)
          continue
      us=[u for u in await s.E("BOT.units()") if not u['done']]
      if not us:await s.pg.wait_for_timeout(50);continue
      # nearest undone unit to where the stream is now, fragile ones with spray
      cur=await s.E("(()=>{const h=SIM.trace(SIM.S.aimAz,SIM.S.aimEl,SIM.S.mode);return [h.x,h.y]})()")
      us.sort(key=lambda u:math.hypot(u['x']-cur[0],u['y']-cur[1])+(0 if u['fragile']==(x['mode']=='spray') else 3))
      u=us[0];m='spray' if u['fragile'] else 'jet'
      await s.mode(m)
      a=await s.E(f"BOT.aim({u['id']},'{m}')")
      if not a:
        if log:print('no aim for',u)
        await s.pg.wait_for_timeout(100);continue
      az,el=a[0],a[1]
      if s.noise:az+=s.r.gauss(0,s.noise*0.05);el+=s.r.gauss(0,s.noise*3)
      if s.react:
        if s.tc.down:await s.tc.release()
        await s.pg.wait_for_timeout(int(s.react*1000))
      await s.steer(az,el)
      # hold until it's done, re-checking the window and the fill
      if s.noise:  # a person sees where it lands and corrects, with a smaller error each time
        for corr in range(3):
          await s.pg.wait_for_timeout(int(max(.2,s.react)*1000))
          a=await s.E(f"BOT.aim({u['id']},'{m}')")
          if not a:break
          f=0.5**(corr+1);await s.steer(a[0]+s.r.gauss(0,s.noise*0.05*f),a[1]+s.r.gauss(0,s.noise*3*f))
          if await s.E(f"SIM.S.units[{u['id']}].done"):break
      for k in range(80):
        y=await s.E(f"(()=>{{const u=SIM.S.units[{u['id']}];return [u.done||u.w+SIM.live/120/u.cap*{s.lead}>=1.05,u.w,SIM.S.state,SIM.S.win?SIM.S.win.st:'',SIM.S.cat&&SIM.S.cat.st==='dig']}})()")
        if y[0] or y[2]!='play' or y[3] in('watch','twitch') or y[4]:break
        if k%6==5:  # drift (wind, noise): re-aim
          a=await s.E(f"BOT.aim({u['id']},'{m}')")
          if a and not s.noise:await s.steer(a[0],a[1])
        await s.pg.wait_for_timeout(40)
    if s.tc.down:await s.tc.release()
    return await st(s.pg)
