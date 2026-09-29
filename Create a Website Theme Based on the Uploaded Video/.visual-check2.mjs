import { writeFile } from 'node:fs/promises'

const targets = await fetch('http://127.0.0.1:9336/json/list').then(response => response.json())
const page = targets.find(target => target.type === 'page' && target.url.startsWith('http://localhost:5173'))
if (!page) throw new Error('No local-app tab found in isolated Edge.')
const socket = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  const task = pending.get(message.id)
  if (!task) return
  pending.delete(message.id)
  message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result)
})
try {
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const current = ++id
    pending.set(current, { resolve, reject })
    socket.send(JSON.stringify({ id: current, method, params }))
  })
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
  const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
  const capture = async filename => {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
    await writeFile(filename, Buffer.from(result.data, 'base64'))
  }
  const inspect = async label => {
    const result = await evaluate(`(() => {const app=document.querySelector('.app');const kpi=document.querySelector('.gov-kpis button');const body=getComputedStyle(document.body);const cards=[...document.querySelectorAll('.gov-kpis button,.public-kpis button,.ops-kpis button,.indicator-grid button,.alert-card,.field-form,.field-asset,.priority-detail,.spatial-panel,.gov-feed,.inspection-table')];const bright=cards.filter(el=>{const n=getComputedStyle(el).backgroundColor.match(/\\d+/g)?.map(Number)||[];return n.length>=3&&n[0]>215&&n[1]>215&&n[2]>215}).map(el=>el.className||el.tagName);return JSON.stringify({path:location.pathname,appClass:app?.className,rootTheme:document.documentElement.dataset.theme,bodyBackground:body.backgroundColor,headline:document.querySelector('.shell h1')?.innerText,splitChars:document.querySelector('.shell h1')?.querySelectorAll('span').length||0,brightCardCount:bright.length,brightCards:bright.slice(0,8),kpi:kpi&&{background:getComputedStyle(kpi).backgroundColor,value:getComputedStyle(kpi.querySelector('b')).color,label:getComputedStyle(kpi.querySelector('small')).color}})})()`)
    console.log(label, result)
  }
  const openRoute = async label => {
    const found = await evaluate(`(() => {const b=[...document.querySelectorAll('.sidebar nav button')].find(x=>x.innerText.trim().toLowerCase().includes(${JSON.stringify(label.toLowerCase())}));if(!b)return false;b.click();return true})()`)
    if (!found) { console.log('ROUTE NOT FOUND', label); return }
    await pause(label === 'Spatial Analytics' || label === 'Development Insights' ? 1700 : 950)
    await inspect(label.toUpperCase())
    await capture(`.verify-${label.toLowerCase().replace(/[^a-z]+/g,'-')}.png`)
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await pause(1100)
  await capture('.verify-login.png')
  await evaluate("localStorage.setItem('jal-impact-auth',JSON.stringify({authenticated:true,role:'government',governmentRole:'district_officer'}));localStorage.setItem('jal-impact-theme-v2','light');location.reload();true")
  await pause(2300)
  await inspect('GOVERNMENT OVERVIEW / STALE LIGHT PREF')
  await capture('.verify-government.png')
  const point = await evaluate("(() => {const b=document.querySelector('.sidebar nav button:nth-child(2)');const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()")
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y,button:'none'})
  await pause(230)
  console.log('HOVER',await evaluate("(() => {const e=document.querySelector('.sidebar nav button:nth-child(2)'),s=getComputedStyle(e);return JSON.stringify({label:e.innerText.trim(),background:s.backgroundColor,border:s.borderColor,transform:s.transform,shine:getComputedStyle(e,'::after').opacity})})()"))
  await capture('.verify-hover.png')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  await pause(100)
  console.log('FOCUS',await evaluate("(() => {const e=document.activeElement,s=getComputedStyle(e);return JSON.stringify({label:e.innerText?.trim(),inCommandCenter:!!e.closest('.sidebar nav'),outline:s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor})})()"))
  await capture('.verify-focus.png')

  await openRoute('Field Observation')
  await openRoute('Spatial Analytics')
  await openRoute('Priority Intervention')
  await openRoute('Alerts')
  await openRoute('Reports')
  await openRoute('GIS Map')
  await evaluate("history.replaceState({},'', '/');localStorage.setItem('jal-impact-auth',JSON.stringify({authenticated:true,role:'public'}));localStorage.setItem('jal-impact-theme-v2','water');location.reload();true")
  await pause(2200)
  await inspect('PUBLIC OVERVIEW / STALE WATER PREF')
  await capture('.verify-public.png')
  await openRoute('Development Insights')
  await openRoute('Geo-Coded Images')
} finally {
  try { socket.close() } catch {}
}
