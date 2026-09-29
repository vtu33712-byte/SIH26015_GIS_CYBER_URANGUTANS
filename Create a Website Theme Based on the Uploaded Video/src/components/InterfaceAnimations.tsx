import { useEffect } from 'react'
import { animate, createTimeline, onScroll, splitText, stagger, utils, waapi } from 'animejs'

const headingSelector = [
  '.hero h1', '.public-hero h1', '.content-hero h1', '.gis-title h1',
  '.gov-welcome h1', '.operations-hero h1', '.field-header h1',
  '.temporal-hero h1', '.analytics-map-head h1', '.priority-map-head h1',
  '.alerts-hero h1', '.public-gis-head h1', '.module-placeholder h1',
].join(',')

const pageSelector = [
  '.shell > .page', '.shell > .analytics-page', '.shell > .priority-page',
  '.shell > .field-observation', '.shell > .temporal-page',
  '.shell > .public-gis', '.shell > .operations-page',
  '.shell > .module-placeholder',
].join(',')

const revealSelector = [
  '.signal-grid > article', '.evidence-grid > article', '.gov-evidence-grid > article',
  '.ops-list > article', '.insight-list > article', '.report-grid > article',
  '.story-strip', '.field-cta', '.planning-context', '.gov-kpis > button',
  '.public-kpis > button', '.ops-kpis > button', '.gov-command-grid > article',
  '.government-indicator > *', '.indicator-grid > button', '.alert-tabs > button',
  '.alert-list > .alert-card', '.priority-reasons > span', '.spatial-panel > button',
  '.analytics-story > b', '.inspection-row', '.field-form > *',
  '.temporal-indicators > *', '.comparison-results > *', '.critical-row',
  '.public-layer-card > label', '.gov-layer-card > label', '.story-flow > b',
  '.signal-bar > div', '.priority-legend > span',
].join(',')

const ambientSelector = '.hero-orbit .orbit,.gov-radar .radar-sweep,.public-wave,.placeholder-orbit'
const interactiveSelector = [
  '.gov-kpis > button', '.public-kpis > button', '.ops-kpis > button',
  '.gov-feed > button', '.command-map', '.government-indicator button',
  '.critical-row', '.critical-drawer button', '.alert-tabs > button',
  '.alert-list > .alert-card', '.alert-drawer button', '.spatial-panel > button',
  '.priority-detail button', '.field-select button', '.gov-layer-card button',
  '.public-layer-card button', '.inspection-table button', '.inspection-drawer button',
  '.sidebar nav > button', '.header-search-trigger', '.header-action', '.profile-trigger',
  '.search-dialog .search-result', '.report-card-actions > button', '.report-preview-actions > button',
  '.report-grid > article', '.signal-grid > article', '.evidence-grid > article',
  '.login-role', '.login-submit', '.hero-actions > button', '.history-bars',
  '.gov-map-tools > button', '.public-evidence footer > button',
].join(',')

type Props = { view: string }
type Motion = ReturnType<typeof animate>
type Timeline = ReturnType<typeof createTimeline>
type HoverBinding = { target: HTMLElement; timeline: Timeline; enter: () => void; leave: () => void }

function buildGovernmentDashboardTimeline(dashboard: HTMLElement): Timeline {
  const timeline = createTimeline({ autoplay: true, defaults: { duration: 520, ease: 'out(3)' } })
  const welcomeCopy = dashboard.querySelector<HTMLElement>('.gov-welcome > div:first-child')
  const radar = dashboard.querySelector<HTMLElement>('.gov-radar')
  const metricCards = Array.from(dashboard.querySelectorAll<HTMLElement>('.gov-kpis > button'))
  const mapWidget = dashboard.querySelector<HTMLElement>('.command-map')
  const feedWidget = dashboard.querySelector<HTMLElement>('.gov-feed')
  const feedRows = Array.from(dashboard.querySelectorAll<HTMLElement>('.gov-feed > button'))
  const indicator = dashboard.querySelector<HTMLElement>('.government-indicator')
  const indicatorRings = Array.from(dashboard.querySelectorAll<HTMLElement>('.government-indicator .indicator-ring'))
  const indicatorCopy = indicator?.querySelector<HTMLElement>(':scope > div:not(.indicator-ring)')
  const indicatorEvidence = Array.from(indicator?.querySelectorAll<HTMLElement>('.indicator-breakdown > span') || [])
  const indicatorAction = indicator?.querySelector<HTMLElement>('.text-btn')
  const indicatorHealth = indicator?.querySelector<HTMLElement>('.indicator-ring > span')

  timeline.label('welcome', 0)
  if (welcomeCopy) timeline.add(welcomeCopy, { opacity: [0, 1], y: [18, 0], duration: 560 }, 'welcome')
  if (radar) timeline.add(radar, { opacity: [0, 1], scale: [0.88, 1], rotate: [-7, 0], duration: 680 }, 90)

  timeline.label('metrics', 210)
  if (metricCards.length) timeline.add(metricCards, {
    opacity: [0, 1], y: [24, 0], scale: [0.955, 1],
    delay: stagger(78), duration: 560,
  }, 'metrics')

  timeline.label('command-widgets', 610)
  if (mapWidget) timeline.add(mapWidget, { opacity: [0, 1], x: [-18, 0], y: [14, 0], duration: 590 }, 'command-widgets')
  if (feedWidget) timeline.add(feedWidget, { opacity: [0, 1], x: [18, 0], y: [14, 0], duration: 590 }, 'command-widgets+=90')
  if (feedRows.length) timeline.add(feedRows, {
    opacity: [0, 1], x: [12, 0], delay: stagger(72), duration: 430,
  }, 'command-widgets+=260')

  timeline.label('indicator', 1120)
  if (indicator) timeline.add(indicator, { opacity: [0, 1], y: [18, 0], scale: [0.985, 1], duration: 600 }, 'indicator')
  if (indicatorRings.length) timeline.add(indicatorRings, {
    opacity: [0.4, 1], scale: [0.91, 1], delay: stagger(95), duration: 620,
  }, 'indicator+=150')
  if (indicatorCopy) timeline.add(indicatorCopy, {
    opacity: [0, 1], x: [20, 0], duration: 560,
  }, 'indicator+=130')
  if (indicatorEvidence.length) timeline.add(indicatorEvidence, {
    opacity: [0, 1], y: [10, 0], delay: stagger(68), duration: 420,
  }, 'indicator+=290')
  if (indicatorAction) timeline.add(indicatorAction, {
    opacity: [0, 1], y: [14, 0], scale: [0.96, 1], duration: 480,
  }, 'indicator+=470')
  if (indicatorHealth) timeline.add(indicatorHealth, {
    opacity: [0, 1], scale: [0.82, 1], duration: 430,
  }, 'indicator+=520')

  return timeline
}

function buildHoverTimeline(target: HTMLElement): Timeline {
  const timeline = createTimeline({ autoplay: false, defaults: { duration: 220, ease: 'out(3)' } })
  const badge = target.querySelector<HTMLElement>(':scope > span, .feed-dot, .risk-dot, .alert-level, .priority-level')
  const value = target.querySelector<HTMLElement>(':scope > b, :scope > strong')
  const arrow = target.querySelector<HTMLElement>(':scope > svg:last-of-type, .text-btn svg:last-of-type')
  const assetDots = Array.from(target.querySelectorAll<HTMLElement>('.asset-dot'))
  const icon = target.querySelector<HTMLElement>(':scope > svg, .report-icon, .role-icon')
  const cardLike = target.matches('.gov-kpis > button, .public-kpis > button, .ops-kpis > button, .report-grid > article, .signal-grid > article, .evidence-grid > article, .alert-list > .alert-card, .gov-feed > button')

  timeline.add(target, cardLike ? { y: [0, -3], scale: [1, 1.018], duration: 250 } : { scale: [1, 1.035], duration: 190 }, 0)
  if (badge) timeline.add(badge, { scale: [1, 1.13], rotate: [0, 5] }, 0)
  if (value) timeline.add(value, { y: [0, -2], scale: [1, 1.045] }, 25)
  if (icon) timeline.add(icon, { scale: [1, 1.12], rotate: [0, 5], duration: 230 }, 15)
  if (assetDots.length) timeline.add(assetDots, {
    scale: [1, 1.25], opacity: [0.72, 1], delay: stagger(58), duration: 260,
  }, 20)
  if (arrow) timeline.add(arrow, { x: [0, 4], opacity: [0.72, 1], duration: 190 }, 65)

  return timeline
}

function buildMetricCountAnimations(root: ParentNode): Motion[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(
    '.gov-kpis > button > b, .public-kpis > button > b, .ops-kpis > button > b, .signal-bar b, .score > span, .government-indicator .indicator-ring > b',
  ))
  return nodes.flatMap(node => {
    const match = (node.textContent || '').trim().match(/^([\d,]+)(.*)$/)
    if (!match) return []
    const finalValue = Number(match[1].replace(/,/g, ''))
    if (!Number.isFinite(finalValue)) return []
    const counter = { value: 0 }
    return [animate(counter, {
      value: finalValue,
      duration: Math.min(1500, 760 + Math.log10(finalValue + 1) * 150),
      ease: 'out(4)',
      onUpdate: () => { node.textContent = `${Math.round(counter.value).toLocaleString()}${match[2]}` },
    })]
  })
}

export function InterfaceAnimations({ view }: Props) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const heading = utils.$(headingSelector).find((target): target is HTMLElement => target instanceof HTMLElement)
    let headingSplit: ReturnType<typeof splitText> | undefined
    let headingAnimation: ReturnType<typeof waapi.animate> | undefined

    if (heading) {
      headingSplit = splitText(heading, { words: false, chars: true })
      headingAnimation = waapi.animate(headingSplit.chars, {
        translate: ['0 .35rem', '0 0'],
        opacity: [0, 1],
        delay: stagger(17),
        duration: 560,
        ease: 'out(3)',
      })
    }

    const page = utils.$(pageSelector).find((target): target is HTMLElement => target instanceof HTMLElement)
    const pageEntrance = page ? animate(page, {
      opacity: [0, 1],
      y: [12, 0],
      duration: 460,
      ease: 'out(3)',
    }) : undefined

    const dashboard = view === 'overview' ? document.querySelector<HTMLElement>('.government-page') : null
    const dashboardTimeline = dashboard ? buildGovernmentDashboardTimeline(dashboard) : undefined

    const observers: Array<ReturnType<typeof onScroll>> = []
    const revealAnimations: Motion[] = []
    const revealTargets = utils.$(revealSelector)
      .filter((target): target is HTMLElement => target instanceof HTMLElement)
      .filter(target => !dashboard?.contains(target))

    revealTargets.forEach((target, index) => {
      const observer = onScroll({ target })
      observers.push(observer)
      revealAnimations.push(animate(target, {
        opacity: [0, 1],
        y: [16, 0],
        duration: 540,
        delay: (index % 5) * 48,
        ease: 'out(3)',
        autoplay: observer,
      }))
    })

    const ambientAnimations = utils.$(ambientSelector)
      .filter((target): target is HTMLElement => target instanceof HTMLElement)
      .map((target, index) => animate(target, {
        opacity: [0.68, 1],
        duration: 2100 + index * 260,
        delay: index * 120,
        alternate: true,
        loop: true,
        ease: 'inOut(2)',
      }))

    const hoverBindings: HoverBinding[] = []
    const boundTargets = new WeakSet<HTMLElement>()
    const attachHover = (target: HTMLElement) => {
      if (boundTargets.has(target)) return
      boundTargets.add(target)
      const timeline = buildHoverTimeline(target)
      const enter = () => { timeline.reversed = false; timeline.restart() }
      const leave = () => { timeline.reversed = true; timeline.play() }
      target.addEventListener('pointerenter', enter)
      target.addEventListener('pointerleave', leave)
      target.addEventListener('focus', enter)
      target.addEventListener('blur', leave)
      hoverBindings.push({ target, timeline, enter, leave })
    }
    const scanForWidgets = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(interactiveSelector)) attachHover(root)
      root.querySelectorAll<HTMLElement>(interactiveSelector).forEach(attachHover)
    }
    const appRoot = document.querySelector<HTMLElement>('.app')
    const metricAnimations = appRoot ? buildMetricCountAnimations(appRoot) : []
    const progressAnimations: Motion[] = []
    let widgetObserver: MutationObserver | undefined
    if (appRoot) {
      scanForWidgets(appRoot)
      Array.from(appRoot.querySelectorAll<HTMLElement>('.progress > i')).forEach(target => {
        target.style.transformOrigin = 'left center'
        const observer = onScroll({ target })
        observers.push(observer)
        progressAnimations.push(animate(target, {
          scaleX: [0, 1], duration: 1100, ease: 'out(4)', autoplay: observer,
        }))
      })
      widgetObserver = new MutationObserver(records => records.forEach(record => {
        record.addedNodes.forEach(node => { if (node instanceof HTMLElement) scanForWidgets(node) })
      }))
      widgetObserver.observe(appRoot, { childList: true, subtree: true })
    }

    return () => {
      widgetObserver?.disconnect()
      hoverBindings.forEach(({ target, timeline, enter, leave }) => {
        target.removeEventListener('pointerenter', enter)
        target.removeEventListener('pointerleave', leave)
        target.removeEventListener('focus', enter)
        target.removeEventListener('blur', leave)
        timeline.revert()
      })
      dashboardTimeline?.revert()
      observers.forEach(observer => observer.revert())
      revealAnimations.forEach(animation => animation.revert())
      metricAnimations.forEach(animation => animation.revert())
      progressAnimations.forEach(animation => animation.revert())
      pageEntrance?.revert()
      headingAnimation?.revert()
      headingSplit?.revert()
      ambientAnimations.forEach(animation => animation.revert())
    }
  }, [view])

  return null
}
