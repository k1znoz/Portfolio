<script>
  import { onMount } from 'svelte'

  import AboutSection from './components/AboutSection.svelte'
  import ContactSection from './components/ContactSection.svelte'
  import CvPage from './components/CvPage.svelte'
  import CvShowcase from './components/CvShowcase.svelte'
  import GamePage from './components/GamePage.svelte'
  import AdminPage from './components/AdminPage.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import MetricsPanel from './components/MetricsPanel.svelte'
  import ProjectsSection from './components/ProjectsSection.svelte'
  import TowerDefensePage from './components/TowerDefensePage.svelte'
  import TopNav from './components/TopNav.svelte'
  import { fetchProjects } from './lib/api-client'
  import {
    contactLinks,
    cvProfile,
    cvWeb,
    metrics,
    projects,
    services,
    stack,
    themes,
  } from './data/portfolio'

  const drifts = [
    { x: '24px', y: '-18px', r: '1.8deg' },
    { x: '-20px', y: '16px', r: '-1.5deg' },
    { x: '18px', y: '20px', r: '1.2deg' },
  ]

  const ownerName = 'k1znoz'
  const baseStack = [...stack]
  const excludedLanguages = new Set(['Shell'])

  let themeIndex = Math.max(
    0,
    themes.findIndex((theme) => theme.id === 'neon')
  )
  let isSwitching = false
  let switchCount = 0
  let currentPath = '/'
  let runtimeProjects = [...projects]
  let runtimeStack = [...baseStack]
  let runtimeCvWeb = {
    ...cvWeb,
    skills: [...cvWeb.skills],
  }
  let scrollProgress = 0
  let parallaxOffset = 0
  let cursorX = 50
  let cursorY = 25
  const currentYear = new Date().getFullYear()

  function normalizePath(pathname) {
    if (pathname === '/cv') return '/cv'
    if (pathname === '/game') return '/game'
    if (pathname === '/tower-defense') return '/tower-defense'
    if (pathname === '/admin') return '/admin'
    return '/'
  }

  function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function runWithViewTransition(update, types = []) {
    if (typeof document === 'undefined' || prefersReducedMotion()) {
      update()
      return
    }

    if (!document.startViewTransition) {
      update()
      return
    }

    document.startViewTransition({
      update,
      types,
    })
  }


  $: currentTheme = themes[themeIndex]
  $: isCvPage = currentPath === '/cv'
  $: isGamePage = currentPath === '/game' || currentPath === '/tower-defense'
  $: isAdminPage = currentPath === '/admin'
  $: isRoutedPage = isCvPage || isGamePage || isAdminPage
  $: motion = drifts[switchCount % drifts.length]
  $: if (typeof document !== 'undefined') {
    document.body.dataset.theme = currentTheme.id
  }

  function sortByLanguageWeight(items, weightsMap) {
    const originalOrder = new Map(items.map((item, index) => [item, index]))

    return [...items].sort((a, b) => {
      const weightA = weightsMap[a] ?? 0
      const weightB = weightsMap[b] ?? 0

      if (weightA !== weightB) {
        return weightB - weightA
      }

      return (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0)
    })
  }

  async function fetchGithubLanguageWeights(username) {
    const requestOptions = {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    }

    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      requestOptions
    )

    if (!reposResponse.ok) {
      throw new Error('Impossible de recuperer les depots GitHub.')
    }

    const repos = await reposResponse.json()
    const languageMap = {}
    const sourceRepos = repos.filter((repo) => !repo.fork)

    await Promise.all(
      sourceRepos.map(async (repo) => {
        const langResponse = await fetch(repo.languages_url, requestOptions)
        if (!langResponse.ok) {
          return
        }

        const repoLanguages = await langResponse.json()
        for (const [name, bytes] of Object.entries(repoLanguages)) {
          if (excludedLanguages.has(name)) {
            continue
          }

          languageMap[name] = (languageMap[name] ?? 0) + Number(bytes)
        }
      })
    )

    return languageMap
  }

  async function refreshLanguageOrder() {
    try {
      const languageWeights = await fetchGithubLanguageWeights(ownerName)
      const languageSkills = cvWeb.skills.filter((skill) => baseStack.includes(skill))
      const extraSkills = cvWeb.skills.filter((skill) => !baseStack.includes(skill))

      runtimeStack = sortByLanguageWeight(baseStack, languageWeights)
      runtimeCvWeb = {
        ...cvWeb,
        skills: [...sortByLanguageWeight(languageSkills, languageWeights), ...extraSkills],
      }
    } catch {
      // Fallback keeps static local order when GitHub API cannot be reached.
      runtimeStack = [...baseStack]
      runtimeCvWeb = {
        ...cvWeb,
        skills: [...cvWeb.skills],
      }
    }
  }

  async function refreshProjects() {
    try {
      const apiProjects = await fetchProjects()
      if (Array.isArray(apiProjects) && apiProjects.length > 0) {
        runtimeProjects = apiProjects
      }
    } catch {
      // Keep local static projects when API cannot be reached.
      runtimeProjects = [...projects]
    }
  }

  onMount(() => {
    const normalized = normalizePath(window.location.pathname)
    currentPath = normalized
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let rafId = 0

    refreshLanguageOrder()
    refreshProjects()
    if (window.location.pathname !== normalized) {
      window.history.replaceState({}, '', normalized)
    }

    const onPopState = () => {
      currentPath = normalizePath(window.location.pathname)
    }

    const updateAmbientMotion = () => {
      rafId = 0

      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
      const nextProgress = (window.scrollY / maxScroll) * 100

      scrollProgress = Number.isFinite(nextProgress) ? Math.max(0, Math.min(100, nextProgress)) : 0
      parallaxOffset = reduceMotionQuery.matches ? 0 : Math.min(window.scrollY * 0.08, 56)
    }

    const requestAmbientMotionUpdate = () => {
      if (rafId) {
        return
      }

      rafId = window.requestAnimationFrame(updateAmbientMotion)
    }

    const onPointerMove = (event) => {
      if (reduceMotionQuery.matches) {
        cursorX = 50
        cursorY = 25
        return
      }

      cursorX = (event.clientX / window.innerWidth) * 100
      cursorY = (event.clientY / window.innerHeight) * 100
    }

    const onMotionPreferenceChange = () => {
      if (reduceMotionQuery.matches) {
        parallaxOffset = 0
        cursorX = 50
        cursorY = 25
      }
      requestAmbientMotionUpdate()
    }

    updateAmbientMotion()

    window.addEventListener('popstate', onPopState)
    window.addEventListener('scroll', requestAmbientMotionUpdate, { passive: true })
    window.addEventListener('resize', requestAmbientMotionUpdate)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    reduceMotionQuery.addEventListener('change', onMotionPreferenceChange)

    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('scroll', requestAmbientMotionUpdate)
      window.removeEventListener('resize', requestAmbientMotionUpdate)
      window.removeEventListener('pointermove', onPointerMove)
      reduceMotionQuery.removeEventListener('change', onMotionPreferenceChange)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  })

  function navigateTo(path) {
    const normalized = normalizePath(path)

    if (currentPath === normalized) {
      return
    }

    runWithViewTransition(
      () => {
        if (typeof window !== 'undefined' && window.location.pathname !== normalized) {
          window.history.pushState({}, '', normalized)
        }

        currentPath = normalized
      },
      ['route']
    )

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function nextTheme() {
    if (isSwitching) return

    runWithViewTransition(
      () => {
        isSwitching = true
        themeIndex = (themeIndex - 1 + themes.length) % themes.length
        switchCount += 1
      },
      ['theme']
    )

    setTimeout(() => {
      isSwitching = false
    }, 850)
  }

  function selectTheme(themeId) {
    if (isSwitching) return

    const targetIndex = themes.findIndex((theme) => theme.id === themeId)
    if (targetIndex === -1 || targetIndex === themeIndex) return

    runWithViewTransition(
      () => {
        isSwitching = true
        themeIndex = targetIndex
        switchCount += 1
      },
      ['theme']
    )

    setTimeout(() => {
      isSwitching = false
    }, 850)
  }
</script>

<main
  class={`portfolio-shell theme-${currentTheme.id} ${isSwitching ? 'is-switching' : ''}`}
  style={`--drift-x:${motion.x};--drift-y:${motion.y};--drift-r:${motion.r};--scroll-progress:${scrollProgress}%;--parallax-offset:${parallaxOffset}px;--cursor-x:${cursorX}%;--cursor-y:${cursorY}%;`}
>
  <div class="scroll-progress" aria-hidden="true"></div>
  <div class="ambience-glow" aria-hidden="true"></div>

  <div class="portfolio-inner">
    <TopNav
      {ownerName}
      {themes}
      {currentTheme}
      isCvPage={isRoutedPage}
      onSwitchTheme={nextTheme}
      onSelectTheme={selectTheme}
      onOpenCvPage={() => navigateTo('/cv')}
      onOpenAdminPage={() => navigateTo('/admin')}
      onOpenHomePage={() => navigateTo('/')}
    />

    {#if isCvPage}
      <CvPage {cvProfile} cvWeb={runtimeCvWeb} {currentTheme} />
    {:else if isAdminPage}
      <AdminPage onOpenHomePage={() => navigateTo('/')} onProjectsUpdated={refreshProjects} />
    {:else if isGamePage}
      {#if currentPath === '/tower-defense'}
        <TowerDefensePage onOpenHomePage={() => navigateTo('/')} />
      {:else}
        <GamePage onOpenHomePage={() => navigateTo('/')} />
      {/if}
    {:else}
      <HeroSection {currentTheme} stack={runtimeStack} />
      <MetricsPanel {metrics} />
      <CvShowcase {cvProfile} onOpenCvPage={() => navigateTo('/cv')} />
      <ProjectsSection projects={runtimeProjects} />
      <AboutSection {services} />
      <ContactSection {contactLinks} />
    {/if}

    <footer class="panel site-footer">
      <p>© {currentYear} {ownerName}. Portfolio evolutif construit avec Svelte.</p>
      <a href="#hero">Retour en haut</a>
    </footer>
  </div>
</main>
