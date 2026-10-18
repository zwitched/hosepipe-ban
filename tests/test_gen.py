# Generated gardens (Heatwave, daily): always winnable on paper (every plant reachable by a clean shot), no overlapping
# plants, more features as depth grows, deterministic for a seed.
from util import *
async def main():
  t=T('gen')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,'Pixel 7');E=pg.evaluate
    r=await E("""(()=>{const out={unreach:0,fallback:0,overlap:0,feat:{},n:0,same:true};
      for(let s=0;s<48;s++){const d=1+(s%16);const l=LEVELS.gen(9000+s*31,d);out.n++;if(l.id.startsWith('fallback'))out.fallback++;
        if(LEVELS.reachable(l).length)out.unreach++;
        const c=[...(l.pots||[]).map(p=>[p.x,p.y,.5]),...(l.baskets||[]).map(p=>[p.x,p.y,.5])];
        for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++)if(Math.hypot(c[i][0]-c[j][0],c[i][1]-c[j][1])<.8)out.overlap++;
        for(const p of l.pots||[])for(const bd of l.beds||[])if(p.x>bd.x0-.4&&p.x<bd.x1+.4&&p.y>bd.y0-.4&&p.y<bd.y1+.4)out.overlap++;
        const f=['wash','gh','window','cat','wind'].filter(k=>l[k]).length+((l.trees||[]).length?1:0)+((l.baskets||[]).length?1:0)+((l.beds||[]).some(b=>b.fragile)?1:0);
        (out.feat[d]=out.feat[d]||[]).push(f);
        if(JSON.stringify(LEVELS.gen(9000+s*31,d).pots)!==JSON.stringify(l.pots))out.same=false;}
      return out})()""")
    print(r)
    t.chk('48 generated gardens: every plant reachable',r['unreach']==0,r['unreach'])
    t.chk('no generator fallbacks',r['fallback']==0)
    t.chk('no overlapping plants',r['overlap']==0,r['overlap'])
    t.chk('same seed, same garden',r['same'])
    lo=sum(sum(v) for k,v in r['feat'].items() if int(k)<=4)/sum(len(v) for k,v in r['feat'].items() if int(k)<=4)
    hi=sum(sum(v) for k,v in r['feat'].items() if int(k)>=12)/sum(len(v) for k,v in r['feat'].items() if int(k)>=12)
    t.chk('deeper Heatwave gardens combine more hazards',hi>lo+1,round(lo,2),round(hi,2))
    await b.close()
  t.done(errs)
asyncio.run(main())
