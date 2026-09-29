import { writeFile } from 'node:fs/promises'

const targets = await fetch('http://127.0.0.1:9337/json/list').then(response => response.json())
const page = targets.find(target => target.type === 'page' && target.url.startsWith('http://localhost:5173'))
if (!page) throw new Error('No local preview tab found in isolated Edge.')
const socket = new WebSocket(page.webSocketDebuggerUrl)
let nextId = 0
const pending = new Map()
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result)
})
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
    return response.result.value
  }
  const screenshot = async name => {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
    await writeFile(name, Buffer.from(result.data, 'base64'))
  }
  const moveTo = async selector => {
    const point = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    if (!point) throw new Error(`Missing hover target ${selector}`)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none' })
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__motionTrace=[];
    const seen=new WeakMap();
    const selector='.gov-welcome,.gov-radar,.gov-kpis>button,.command-map,.gov-feed,.gov-feed>button,.government-indicator,.indicator-ring';
    new MutationObserver(records=>records.forEach(record=>{
      const el=record.target;
      if(!(el instanceof HTMLElement)||!el.matches(selector))return;
      const style=el.getAttribute('style')||'';
      if(seen.get(el)===style)return;
      seen.set(el,style);
      window.__motionTrace.push({t:Math.round(performance.now()),target:el.className.toString().slice(0,48),style:style.slice(0,95)});
      if(window.__motionTrace.length>220)window.__motionTrace.shift();
    })).observe(document,{attributes:true,attributeFilter:['style'],subtree:true});
  ` })
  await pause(800)
  await evaluate("localStorage.setItem('jal-impact-auth',JSON.stringify({authenticated:true,role:'government',governmentRole:'district_officer'}));localStorage.setItem('jal-impact-theme-v2','dark');location.reload();true")
  await pause(2450)
  console.log('DASHBOARD', await evaluate("JSON.stringify({app:document.querySelector('.app')?.className,heading:document.querySelector('.gov-welcome h1')?.innerText,kpis:document.querySelectorAll('.gov-kpis>button').length,commandWidgets:document.querySelectorAll('.gov-command-grid>article').length,traceCount:window.__motionTrace?.length,sequenceStarts:(()=>{const a=window.__motionTrace||[],m=new Map();for(const e of a)if(!m.has(e.target))m.set(e.target,e.t);return [...m].map(([target,t])=>({target,t}))})()})"))
  await screenshot('.timeline-dashboard.png')

  await moveTo('.gov-kpis > button:not(.critical-kpi)')
  await pause(180)
  console.log('KPI HOVER', await evaluate("(() => {const e=document.querySelector('.gov-kpis>button:not(.critical-kpi)'),i=e.querySelector(':scope>span'),v=e.querySelector('b'),a=e.querySelector(':scope>svg:last-of-type');const s=x=>x&&{transform:getComputedStyle(x).transform,scale:getComputedStyle(x).scale,rotate:getComputedStyle(x).rotate};return JSON.stringify({badge:s(i),value:s(v),arrow:s(a)})})()"))
  await screenshot('.timeline-kpi-hover.png')
  await pause(260)
  await moveTo('.gov-feed > button')
  await pause(180)
  console.log('FEED HOVER', await evaluate("(() => {const e=document.querySelector('.gov-feed>button'),d=e.querySelector('.feed-dot'),a=e.querySelector('svg:last-of-type');const s=x=>x&&{transform:getComputedStyle(x).transform,scale:getComputedStyle(x).scale,rotate:getComputedStyle(x).rotate};return JSON.stringify({dot:s(d),arrow:s(a)})})()"))
  await screenshot('.timeline-feed-hover.png')
  await pause(260)
  await moveTo('.command-map')
  await pause(180)
  console.log('MAP HOVER', await evaluate("(() => {const e=document.querySelector('.command-map'),dots=[...e.querySelectorAll('.asset-dot')];return JSON.stringify(dots.map(x=>({class:x.className,transform:getComputedStyle(x).transform,scale:getComputedStyle(x).scale,opacity:getComputedStyle(x).opacity})))})()"))
  await screenshot('.timeline-map-hover.png')

  await evaluate("document.querySelector('.gov-kpis .critical-kpi')?.click();true")
  await pause(350)
  await moveTo('.critical-row')
  await pause(180)
  console.log('DYNAMIC DRAWER HOVER', await evaluate("(() => {const row=document.querySelector('.critical-row'),dot=row?.querySelector('.risk-dot'),button=row?.querySelector('button');const s=x=>x&&{transform:getComputedStyle(x).transform,scale:getComputedStyle(x).scale,rotate:getComputedStyle(x).rotate};return JSON.stringify({drawer:!!document.querySelector('.critical-drawer'),dot:s(dot),button:s(button)})})()"))
  await screenshot('.timeline-drawer-hover.png')
} finally {
  try { socket.close() } catch {}
}
