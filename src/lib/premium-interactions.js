function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function tiltCard(node, params = {}) {
  if (prefersReducedMotion()) {
    return {}
  }

  const intensity = Number(params.intensity ?? 7)
  const scale = Number(params.scale ?? 1.01)

  let rafId = 0
  let pointerX = 0
  let pointerY = 0

  function applyTilt() {
    rafId = 0

    const rect = node.getBoundingClientRect()
    const x = (pointerX - rect.left) / rect.width
    const y = (pointerY - rect.top) / rect.height
    const rotateY = (x - 0.5) * intensity
    const rotateX = (0.5 - y) * intensity

    node.style.transform = `perspective(920px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`
  }

  function onPointerMove(event) {
    pointerX = event.clientX
    pointerY = event.clientY

    if (!rafId) {
      rafId = window.requestAnimationFrame(applyTilt)
    }
  }

  function resetTilt() {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }

    node.style.transform = 'perspective(920px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  node.style.transition = 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)'
  node.addEventListener('pointermove', onPointerMove)
  node.addEventListener('pointerleave', resetTilt)
  node.addEventListener('blur', resetTilt)

  return {
    destroy() {
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerleave', resetTilt)
      node.removeEventListener('blur', resetTilt)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      node.style.transform = ''
    },
  }
}

export function panelSpotlight(node) {
  node.classList.add('panel-spotlight')

  function onPointerMove(event) {
    const rect = node.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    node.style.setProperty('--spot-x', `${x}px`)
    node.style.setProperty('--spot-y', `${y}px`)
    node.dataset.spotlightActive = 'true'
  }

  function onPointerLeave() {
    node.dataset.spotlightActive = 'false'
  }

  node.addEventListener('pointermove', onPointerMove)
  node.addEventListener('pointerleave', onPointerLeave)

  return {
    destroy() {
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerleave', onPointerLeave)
      node.dataset.spotlightActive = 'false'
    },
  }
}

export function chargeCta(node, params = {}) {
  const delay = Number(params.delay ?? 320)
  let chargeTimer = 0

  node.classList.add('charge-cta')

  function clearTimer() {
    if (chargeTimer) {
      window.clearTimeout(chargeTimer)
      chargeTimer = 0
    }
  }

  function onPointerEnter() {
    if (prefersReducedMotion()) {
      return
    }

    clearTimer()
    chargeTimer = window.setTimeout(() => {
      node.classList.add('is-charged')
    }, delay)
  }

  function onPointerLeave() {
    clearTimer()
    node.classList.remove('is-charged')
  }

  function onRelease() {
    if (!node.classList.contains('is-charged')) {
      return
    }

    node.classList.remove('is-charged')
    node.classList.add('is-releasing')
    window.setTimeout(() => node.classList.remove('is-releasing'), 340)
  }

  node.addEventListener('pointerenter', onPointerEnter)
  node.addEventListener('pointerleave', onPointerLeave)
  node.addEventListener('pointerdown', onRelease)
  node.addEventListener('blur', onPointerLeave)

  return {
    destroy() {
      clearTimer()
      node.removeEventListener('pointerenter', onPointerEnter)
      node.removeEventListener('pointerleave', onPointerLeave)
      node.removeEventListener('pointerdown', onRelease)
      node.removeEventListener('blur', onPointerLeave)
      node.classList.remove('charge-cta', 'is-charged', 'is-releasing')
    },
  }
}

export function constellationSkills(node) {
  const chips = [...node.querySelectorAll('.cv-skill-chip')]

  if (!chips.length || prefersReducedMotion()) {
    return {}
  }

  function clearState() {
    chips.forEach((chip) => {
      chip.style.setProperty('--constellation', '0')
      chip.classList.remove('is-active', 'is-near')
    })
  }

  function onPointerMove(event) {
    let nearestChip = null
    let nearestIndex = -1
    let nearestDistance = Number.POSITIVE_INFINITY

    chips.forEach((chip, index) => {
      const rect = chip.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const distance = Math.hypot(event.clientX - cx, event.clientY - cy)
      const glow = Math.max(0, 1 - distance / 170)

      chip.style.setProperty('--constellation', glow.toFixed(3))

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestChip = chip
        nearestIndex = index
      }
    })

    chips.forEach((chip, index) => {
      chip.classList.remove('is-active', 'is-near')

      if (chip === nearestChip) {
        chip.classList.add('is-active')
      }

      if (nearestIndex !== -1 && Math.abs(index - nearestIndex) === 1) {
        chip.classList.add('is-near')
      }
    })
  }

  node.addEventListener('pointermove', onPointerMove)
  node.addEventListener('pointerleave', clearState)

  return {
    destroy() {
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerleave', clearState)
      clearState()
    },
  }
}
