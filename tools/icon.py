# Renders the app icons with the game's own plant and pot drawing code (run once; output committed).
import asyncio,base64,os
from playwright.async_api import async_playwright
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
JS="""(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 g.fillStyle='#c9b768';g.fillRect(0,0,512,512);const r=U.rng(5);
 for(let i=0;i<3000;i++){g.strokeStyle=r()<.5?'rgba(120,105,45,.35)':'rgba(235,220,150,.35)';g.lineWidth=2;const x=r()*512,y=r()*512;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*6,y-4-r()*6);g.stroke();}
 g.fillStyle='rgba(48,72,18,.35)';for(let i=0;i<30;i++){g.beginPath();g.arc(330+(r()-.5)*90,300+(r()-.5)*60,14+r()*12,0,6.3);g.fill();}
 // pot
 g.fillStyle='rgba(30,20,5,.28)';g.beginPath();g.ellipse(360,360,95,45,0,0,6.3);g.fill();
 g.fillStyle='#b8603a';g.beginPath();g.moveTo(240,250);g.lineTo(255,350);g.ellipse(310,350,55,25,0,Math.PI,0,true);g.lineTo(380,250);g.closePath();g.fill();
 g.fillStyle='#cc7448';g.beginPath();g.ellipse(310,250,72,32,0,0,6.3);g.fill();g.fillStyle='#3a2412';g.beginPath();g.ellipse(310,250,58,24,0,0,6.3);g.fill();
 RD._plant(g,'geranium',310,240,150,1,0,0,1.3);
 // stream
 g.lineCap='round';g.beginPath();g.moveTo(40,500);g.quadraticCurveTo(120,40,300,225);g.strokeStyle='rgba(120,170,205,.45)';g.lineWidth=30;g.stroke();g.strokeStyle='rgba(215,236,250,.95)';g.lineWidth=15;g.stroke();g.strokeStyle='#fff';g.lineWidth=5;g.stroke();
 g.fillStyle='rgba(235,245,255,.95)';for(let i=0;i<14;i++){g.beginPath();g.arc(300+(r()-.5)*80,225+(r()-.5)*40-r()*20,4+r()*4,0,6.3);g.fill();}
 return c.toDataURL('image/png');})()"""
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();await pg.goto('file://'+R+'/index.html');await pg.wait_for_timeout(500)
    d=await pg.evaluate(JS);open(R+'/icon.png','wb').write(base64.b64decode(d.split(',')[1]))
    d=await pg.evaluate("(src=>{const i=new Image();return new Promise(r=>{i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=192;c.getContext('2d').drawImage(i,0,0,192,192);r(c.toDataURL('image/png'))};i.src=src})})",d)
    open(R+'/icon-192.png','wb').write(base64.b64decode(d.split(',')[1]));await b.close()
asyncio.run(m())
