# Served over HTTP like GitHub Pages: loads, registers the service worker, and still loads offline.
import subprocess,time
from util import *
async def main():
  t=T('http');srv=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=str(ROOT),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
  try:
    async with async_playwright() as p:
      b,c,pg,errs=await page(p,'Pixel 7',url='http://127.0.0.1:8765/',clear=False)
      t.chk('index loads over http',await pg.is_visible('#bPlay'))
      ok=await pg.evaluate("navigator.serviceWorker.ready.then(()=>true)");await pg.wait_for_timeout(800)
      t.chk('service worker registered',ok)
      await c.set_offline(True);await pg.reload();await pg.wait_for_timeout(800)
      t.chk('reloads offline from the cache',await pg.is_visible('#bPlay') and await pg.evaluate("typeof SIM==='object'&&typeof RD==='object'"))
      t.chk('manifest linked',await pg.evaluate("!!document.querySelector('link[rel=manifest]')"))
      t.chk('no JS errors',not errs,errs);await b.close()
      b,c,pg,errs=await page(p,'Pixel 7',url='file://'+str(ROOT/'dist/index.html'))
      t.chk('single-file dist/index.html starts with no other files',await pg.is_visible('#bPlay') and await pg.evaluate("typeof SIM==='object'"))
      t.chk('single file: no JS errors',not errs,errs);await b.close()
  finally:srv.terminate()
  t.done([])
asyncio.run(main())
