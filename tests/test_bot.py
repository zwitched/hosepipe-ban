# Difficulty curve: a skilled touch bot plays every garden on Larch Close (must win all), then sloppier bots
# (aim error + slow reactions) play the same gardens; their results should get worse as the street goes on.
import sys
from bot import *
IDS=['no1','no3','no5','no7','no9','no11','no13','no15','no17','no19','no21','no23']
async def play_all(p,profile,ids):
  b,c,pg,errs=await page(p,'Pixel 7');tc=await Touch(pg).init();await fixture(pg);E=pg.evaluate
  await E("FIX.stars({%s})"%','.join(f'{i}:1' for i in IDS))
  out={}
  for lid in ids:
    i=IDS.index(lid);await E(f"GAME.startStreet({i},true)");await pg.wait_for_timeout(150)
    bot=Bot(pg,tc,**profile);x=await bot.play(timeout=150)
    await pg.wait_for_timeout(1300);r=await E("GAME.lastResult")
    out[lid]=dict(won=x['state']=='won',why=x['why'],stars=r['stars'] if r else 0,water=round(x['water'],1),t=round(x['t'],1),done=f"{x['done']}/{x['n']}",sog=x['sog'],flat=x['flat'],soaked=x['soaked'])
    print(json.dumps({'profile':profile,'lvl':lid,**out[lid]}),flush=True)
    if await pg.is_visible('#sResult'):await tc.tapel('#bResMenu')
  await b.close();return out,errs
async def main():
  t=T('bot');which=sys.argv[1] if len(sys.argv)>1 else 'all'
  async with async_playwright() as p:
    if which in('all','skilled'):
      out,errs=await play_all(p,{},IDS)
      for k,v in out.items():t.chk(f'skilled bot beats {k}',v['won'],v)
      t.chk('no JS errors during the skilled run',not errs,errs)
    if which in('all','sloppy'):
      out,errs=await play_all(p,{'noise':1.0,'react':0.35,'seed':7,'lead':0.3},IDS)
      early=sum(v['stars'] for k,v in out.items() if k in IDS[:4]);late=sum(v['stars'] for k,v in out.items() if k in IDS[-4:])
      t.chk('sloppy bot does worse on the last four gardens than the first four',late<early,early,late)
  t.done([])
asyncio.run(main())
