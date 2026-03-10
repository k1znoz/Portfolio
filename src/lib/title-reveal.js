export function titleReveal(node) {
  const sourceText = node.textContent?.trim() ?? ''

  if (!sourceText) {
    return {}
  }

  node.classList.add('title-reveal')
  node.setAttribute('aria-label', sourceText)
  node.textContent = ''

  const words = sourceText.split(/\s+/)

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span')
    wordSpan.className = 'title-reveal__word'
    wordSpan.setAttribute('aria-hidden', 'true')
    wordSpan.style.setProperty('--word-index', String(index))
    wordSpan.textContent = word
    node.append(wordSpan)

    if (index < words.length - 1) {
      node.append(document.createTextNode(' '))
    }
  })

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (reduceMotionQuery.matches || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-visible')
    return {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.disconnect()
        }
      })
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -8% 0px',
    }
  )

  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
    },
  }
}
