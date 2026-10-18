# Shared test helpers. Game actions go through real touch events (CDP Input.dispatchTouchEvent -> the same Pointer
# Event handlers a phone uses). page.evaluate is only used to READ state (and to set up fixtures where stated).
import asyncio,pathlib,json,sys,math
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
URL='file://'+str(ROOT/'index.html')
SHOTS=ROOT/'screenshots'
class T:
  def __init__(s,name):s.name=name;s.bad=[];s.n=0
  def chk(s,label,ok,*info):
    s.n+=1;print(('PASS ' if ok else 'BAD  ')+label,*[json.dumps(i,default=str)[:300] for i in info],flush=True)
    if not ok:s.bad.append(label)
  def done(s,errs):
    print('ERRORS',errs if errs else 'none');print(f'SUMMARY {s.name}: {s.n-len(s.bad)}/{s.n} passed',flush=True)
    if errs or s.bad:sys.exit(1)
async def page(p,dev='Pixel 7',url=URL,clear=True,ctx_kw=None,save=None):
  b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
  kw=dict(p.devices[dev]) if isinstance(dev,str) else dict(dev)
  if ctx_kw:kw.update(ctx_kw)
  c=await b.new_context(**kw);pg=await c.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(url);await pg.wait_for_timeout(300)
  if clear or save is not None:
    await pg.evaluate("localStorage.clear()")
    if save is not None:await pg.evaluate("s=>localStorage.setItem('hosepipeban.v1',JSON.stringify(s))",save)
    await pg.reload();await pg.wait_for_timeout(400)
  return b,c,pg,errs
class Touch:
  def __init__(s,pg):s.pg=pg;s.cdp=None;s.down=False;s.pos=(0,0)
  async def init(s):s.cdp=await s.pg.context.new_cdp_session(s.pg);return s
  async def send(s,kind,pts):await s.cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
  async def press(s,a):await s.send('touchStart',[(0,a)]);s.down=True;s.pos=a
  async def moveto(s,b,steps=6,dt=16):
    a=s.pos
    for k in range(1,steps+1):
      t=k/steps;p=(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);await s.send('touchMove',[(0,p)]);await s.pg.wait_for_timeout(dt)
    s.pos=b
  async def release(s):await s.send('touchEnd',[]);s.down=False
  async def drag(s,a,b,steps=8,dt=16):
    await s.press(a);await s.moveto(b,steps,dt);await s.release()
  async def tap(s,a,hold=40):
    await s.send('touchStart',[(0,a)]);await s.pg.wait_for_timeout(hold);await s.send('touchEnd',[])
  async def center(s,sel):
    return await s.pg.evaluate(f"(()=>{{const r=document.querySelector('{sel}').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height]}})()")
  async def tapel(s,sel):
    c=await s.center(sel);H=await s.pg.evaluate("innerHeight")
    for i in range(5):
      hit=await s.pg.evaluate(f"(()=>{{const el=document.querySelector('{sel}');const h=document.elementFromPoint({c[0]},{c[1]});return !!h&&(h===el||el.contains(h))}})()") if 0<=c[1]<=H-2 else False
      if hit:break
      dy=max(-250,min(250,(H/2)-c[1]));await s.drag((c[0],H/2),(c[0],H/2+dy),steps=10);await s.pg.wait_for_timeout(350);c=await s.center(sel)
    await s.tap((c[0],c[1]));await s.pg.wait_for_timeout(80)
ST="(()=>{const S=SIM.S;return {t:S.t,state:S.state,why:S.why,water:S.water,az:S.aimAz,el:S.aimEl,flow:S.flowing,mode:S.mode,done:S.units.filter(u=>u.done).length,n:S.units.length,sog:S.sog,flat:S.flat,soaked:S.soaked,susp:S.susp,g:GAME.state,started:GAME.started}})()"
async def st(pg):return await pg.evaluate(ST)
