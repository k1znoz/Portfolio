<script>
  import { onMount } from 'svelte'

  import AboutSection from './components/AboutSection.svelte'
  import ContactSection from './components/ContactSection.svelte'
  import CvPage from './components/CvPage.svelte'
  import CvShowcase from './components/CvShowcase.svelte'
  import EditorialSideBubbleNav from './components/EditorialSideBubbleNav.svelte'
  import GamePage from './components/GamePage.svelte'
  import AdminPage from './components/AdminPage.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import MetricsPanel from './components/MetricsPanel.svelte'
  import ProjectsSection from './components/ProjectsSection.svelte'
  import TowerDefensePage from './components/TowerDefensePage.svelte'
  import TopNav from './components/TopNav.svelte'
  import ContactTerminal from './components/ThemeCyberBrute/ContactTerminal.svelte'
  import CyberFooter from './components/ThemeCyberBrute/Footer.svelte'
  import Hero from './components/ThemeCyberBrute/Hero.svelte'
  import ProcessSection from './components/ThemeCyberBrute/ProcessSection.svelte'
  import ProjectGrid from './components/ThemeCyberBrute/ProjectGrid.svelte'
  import SideNavBar from './components/ThemeCyberBrute/SideNavBar.svelte'
  import StatsBento from './components/ThemeCyberBrute/StatsBento.svelte'
  import TopAppBar from './components/ThemeCyberBrute/TopAppBar.svelte'
  // ── IronCode theme ────────────────────────────────────────────────────────
  import IronTopAppBar from './components/ThemeIronCode/TopAppBar.svelte'
  import IronHero from './components/ThemeIronCode/Hero.svelte'
  import IronStatsBar from './components/ThemeIronCode/StatsBar.svelte'
  import IronProjectGrid from './components/ThemeIronCode/ProjectGrid.svelte'
  import IronSkillGrades from './components/ThemeIronCode/SkillGrades.svelte'
  import IronTimeline from './components/ThemeIronCode/Timeline.svelte'
  import IronContactForge from './components/ThemeIronCode/ContactForge.svelte'
  import IronFooter from './components/ThemeIronCode/Footer.svelte'
  import GlassTopNavBar from './components/ThemeGlassMorphism/TopNavBar.svelte'
  import GlassHero from './components/ThemeGlassMorphism/Hero.svelte'
  import GlassStatsStrip from './components/ThemeGlassMorphism/StatsStrip.svelte'
  import GlassProjectGrid from './components/ThemeGlassMorphism/ProjectGrid.svelte'
  import GlassCvPanel from './components/ThemeGlassMorphism/CvPanel.svelte'
  import GlassAboutSkills from './components/ThemeGlassMorphism/AboutSkills.svelte'
  import GlassContactForm from './components/ThemeGlassMorphism/ContactForm.svelte'
  import GlassFooter from './components/ThemeGlassMorphism/Footer.svelte'
  import GlitchTransitionOverlay from './components/GlitchTransitionOverlay.svelte'
  import { fetchProjects } from './lib/api-client'
  import {
    contactLinks,
    cvProfile,
    cvWeb,
    layoutThemes,
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
  let isLayoutSwitching = false
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
  let glitchTrigger = 0
  let glitchMode = 'theme'
  let isGlobalSwitcherOpen = false
  let globalSwitcherPanelEl
  let globalSwitcherTriggerEl
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
  let layoutThemeIndex = 0
  $: currentLayoutTheme = layoutThemes[layoutThemeIndex]
  $: isCvPage = currentPath === '/cv'
  $: isGamePage = currentPath === '/game' || currentPath === '/tower-defense'
  $: isAdminPage = currentPath === '/admin'
  $: isRoutedPage = isCvPage || isGamePage || isAdminPage
  $: isCyberBruteLayout = !isRoutedPage && currentLayoutTheme.id === 'cyber-brute'
  $: isIronCodeLayout   = !isRoutedPage && currentLayoutTheme.id === 'iron-code'
  $: isGlassMorphismLayout = !isRoutedPage && currentLayoutTheme.id === 'glass-morphism'
  $: githubProfileLink =
    contactLinks.find((link) => link.label.toLowerCase().includes('github'))?.href ??
    'https://github.com/k1znoz'
  $: githubHandle = githubProfileLink.split('/').filter(Boolean).pop() ?? ownerName
  $: stackSummary = runtimeStack.slice(0, 2).join(' + ') || 'Svelte + Laravel'
  $: locationSummary = runtimeCvWeb.contact?.[0]?.split(',').slice(-1)[0]?.trim() ?? 'Voutezac'
  $: motion = drifts[switchCount % drifts.length]
  $: if (typeof document !== 'undefined') {
    document.body.dataset.theme = currentTheme.id
    document.body.dataset.layoutTheme = currentLayoutTheme.id
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
    const storedThemeId = window.localStorage.getItem('portfolio-theme-id')
    const storedLayoutThemeId = window.localStorage.getItem('portfolio-layout-theme-id')
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let rafId = 0

    if (storedThemeId) {
      const storedThemeIndex = themes.findIndex((theme) => theme.id === storedThemeId)
      if (storedThemeIndex !== -1) {
        themeIndex = storedThemeIndex
      }
    }

    if (storedLayoutThemeId) {
      const storedLayoutIndex = layoutThemes.findIndex((theme) => theme.id === storedLayoutThemeId)
      if (storedLayoutIndex !== -1) {
        layoutThemeIndex = storedLayoutIndex
      }
    }

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

    const onLayoutAnchorClick = (event) => {
      if (!isCyberBruteLayout && !isIronCodeLayout && !isGlassMorphismLayout) {
        return
      }

      const trigger = event.target?.closest?.('a[href^="#"]')
      if (!trigger) {
        return
      }

      const hash = trigger.getAttribute('href')
      if (!hash || hash.length < 2) {
        return
      }

      const target = document.querySelector(hash)
      if (!target) {
        return
      }

      event.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState({}, '', hash)
    }

    const onGlobalPointerDown = (event) => {
      if (!isGlobalSwitcherOpen) {
        return
      }

      const target = event.target
      const clickedInsidePanel = globalSwitcherPanelEl?.contains(target)
      const clickedTrigger = globalSwitcherTriggerEl?.contains(target)

      if (clickedInsidePanel || clickedTrigger) {
        return
      }

      isGlobalSwitcherOpen = false
    }

    const onGlobalKeyDown = (event) => {
      if (event.key === 'Escape' && isGlobalSwitcherOpen) {
        isGlobalSwitcherOpen = false
      }
    }

    updateAmbientMotion()

    window.addEventListener('popstate', onPopState)
    window.addEventListener('scroll', requestAmbientMotionUpdate, { passive: true })
    window.addEventListener('resize', requestAmbientMotionUpdate)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('click', onLayoutAnchorClick)
    window.addEventListener('pointerdown', onGlobalPointerDown)
    window.addEventListener('keydown', onGlobalKeyDown)
    reduceMotionQuery.addEventListener('change', onMotionPreferenceChange)

    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('scroll', requestAmbientMotionUpdate)
      window.removeEventListener('resize', requestAmbientMotionUpdate)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('click', onLayoutAnchorClick)
      window.removeEventListener('pointerdown', onGlobalPointerDown)
      window.removeEventListener('keydown', onGlobalKeyDown)
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

  function scrollToSection(sectionId) {
    if (typeof document === 'undefined') {
      return
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function nextTheme() {
    if (isSwitching) return

    runWithViewTransition(
      () => {
        isSwitching = true
        glitchMode = 'theme'
        glitchTrigger += 1
        themeIndex = (themeIndex - 1 + themes.length) % themes.length
        switchCount += 1
      },
      ['theme']
    )

    setTimeout(() => {
      isSwitching = false
    }, 850)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio-theme-id', themes[themeIndex].id)
    }
  }

  function selectTheme(themeId) {
    if (isSwitching) return

    const targetIndex = themes.findIndex((theme) => theme.id === themeId)
    if (targetIndex === -1 || targetIndex === themeIndex) return

    runWithViewTransition(
      () => {
        isSwitching = true
        glitchMode = 'theme'
        glitchTrigger += 1
        themeIndex = targetIndex
        switchCount += 1
      },
      ['theme']
    )

    setTimeout(() => {
      isSwitching = false
    }, 850)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio-theme-id', themeId)
    }
  }

  function selectLayoutTheme(layoutThemeId) {
    if (isLayoutSwitching) return

    const targetIndex = layoutThemes.findIndex((theme) => theme.id === layoutThemeId)
    if (targetIndex === -1 || targetIndex === layoutThemeIndex) return

    runWithViewTransition(
      () => {
        isLayoutSwitching = true
        glitchMode = 'layout'
        glitchTrigger += 1
        layoutThemeIndex = targetIndex
      },
      ['layout']
    )

    setTimeout(() => {
      isLayoutSwitching = false
    }, 700)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio-layout-theme-id', layoutThemeId)
    }
  }
</script>

<main
  class={`portfolio-shell theme-${currentTheme.id} layout-${currentLayoutTheme.id} ${isCyberBruteLayout ? 'is-cyber-brute' : ''} ${isIronCodeLayout ? 'is-iron-code' : ''} ${isGlassMorphismLayout ? 'is-glass-morphism' : ''} ${isSwitching || isLayoutSwitching ? 'is-switching' : ''} ${isSwitching ? 'is-theme-switching' : ''} ${isLayoutSwitching ? 'is-layout-switching' : ''}`}
  style={`--drift-x:${motion.x};--drift-y:${motion.y};--drift-r:${motion.r};--scroll-progress:${scrollProgress}%;--parallax-offset:${parallaxOffset}px;--cursor-x:${cursorX}%;--cursor-y:${cursorY}%;`}
>
  <div class="scroll-progress" aria-hidden="true"></div>
  <div class="ambience-glow" aria-hidden="true"></div>
  <GlitchTransitionOverlay trigger={glitchTrigger} mode={glitchMode} />
  <div class="transition-glitch transition-glitch--primary" aria-hidden="true"></div>
  <div class="transition-glitch transition-glitch--secondary" aria-hidden="true"></div>

  {#if !isRoutedPage}
    <button
      type="button"
      class={`global-theme-switcher-trigger global-theme-switcher-trigger--layout-${currentLayoutTheme.id} global-theme-switcher-trigger--theme-${currentTheme.id} ${isGlobalSwitcherOpen ? 'is-open' : ''}`}
      aria-label="Afficher les options de thème"
      aria-controls="global-theme-switcher-panel"
      aria-expanded={isGlobalSwitcherOpen}
      on:click={() => (isGlobalSwitcherOpen = !isGlobalSwitcherOpen)}
      bind:this={globalSwitcherTriggerEl}
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {isGlobalSwitcherOpen ? 'close' : 'menu'}
      </span>
    </button>

    <aside
      id="global-theme-switcher-panel"
      class={`global-theme-switcher global-theme-switcher--layout-${currentLayoutTheme.id} global-theme-switcher--theme-${currentTheme.id} ${isGlobalSwitcherOpen ? 'is-open' : ''}`}
      aria-label="Choix du thème et du layout"
      bind:this={globalSwitcherPanelEl}
    >
      <div class="global-theme-switcher__group">
        <p class="global-theme-switcher__label">Layout</p>
        <div class="global-theme-switcher__row" role="tablist" aria-label="Layouts disponibles">
          {#each layoutThemes as layoutTheme}
            <button
              type="button"
              class={`global-theme-switcher__btn ${layoutTheme.id === currentLayoutTheme.id ? 'is-active' : ''}`}
              on:click={() => {
                selectLayoutTheme(layoutTheme.id)
                isGlobalSwitcherOpen = false
              }}
              aria-pressed={layoutTheme.id === currentLayoutTheme.id}
            >
              {layoutTheme.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="global-theme-switcher__group">
        <p class="global-theme-switcher__label">Ambiance</p>
        <div class="global-theme-switcher__row" role="tablist" aria-label="Ambiances disponibles">
          {#each themes as theme}
            <button
              type="button"
              class={`global-theme-switcher__swatch ${theme.id === currentTheme.id ? 'is-active' : ''}`}
              style={`--swatch-a:${theme.colors[0]};--swatch-b:${theme.colors[1]};`}
              on:click={() => {
                selectTheme(theme.id)
                isGlobalSwitcherOpen = false
              }}
              aria-pressed={theme.id === currentTheme.id}
              title={theme.name}
            >
              <span class="sr-only">{theme.name}</span>
            </button>
          {/each}
          <button
            type="button"
            class="global-theme-switcher__cycle"
            on:click={() => {
              nextTheme()
              isGlobalSwitcherOpen = false
            }}
          >
            ↻
          </button>
        </div>
      </div>
    </aside>
  {/if}

  {#if isCyberBruteLayout}
    <TopAppBar
      ownerName={ownerName}
      githubUrl={githubProfileLink}
      cvFileUrl={cvProfile.fileUrl}
      showLayoutToggle={false}
      onJumpProjects={() => scrollToSection('projects')}
      onSwitchToBaseLayout={() => selectLayoutTheme('editorial')}
    />
    <SideNavBar cvFileUrl={cvProfile.fileUrl} />
    <div class="cyber-brute-main pt-16 pb-12 min-h-screen bg-[#0e0e0e] text-on-surface cyber-scrollbar overflow-x-hidden">
      <Hero
        fullName={runtimeCvWeb.fullName}
        title={runtimeCvWeb.title}
        pitch={runtimeCvWeb.pitch}
      />
      <ProjectGrid projects={runtimeProjects} />
      <StatsBento {metrics} />
      <ProcessSection experiences={runtimeCvWeb.experiences} />
      <ContactTerminal {contactLinks} />
    </div>
    <CyberFooter
      {ownerName}
      {currentYear}
      githubHandle={githubHandle}
      stackLabel={stackSummary}
      location={locationSummary}
    />
  {:else if isIronCodeLayout}
    <!-- ── IronCode layout ─────────────────────────────────────────────── -->
    <IronTopAppBar
      showLayoutToggle={false}
      onHireClick={() => scrollToSection('contact')}
      onSwitchToBaseLayout={() => selectLayoutTheme('editorial')}
    />
    <div class="iron-code-main pt-20 min-h-screen bg-[#131313] text-on-surface overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <IronHero
        fullName={runtimeCvWeb.fullName}
        title={runtimeCvWeb.title}
        pitch={runtimeCvWeb.pitch}
        onContactClick={() => scrollToSection('contact')}
      />
      <IronStatsBar {metrics} />
      <IronProjectGrid projects={runtimeProjects} />
      <IronSkillGrades skills={runtimeStack} />
      <IronTimeline experiences={runtimeCvWeb.experiences} />
      <IronContactForge />
    </div>
    <IronFooter {ownerName} {currentYear} {contactLinks} />
  {:else if isGlassMorphismLayout}
    <div class="glass-main">
      <GlassTopNavBar
        {ownerName}
        onContactClick={() => scrollToSection('contact')}
      />
      <div class="glass-main__inner">
        <GlassHero
          title={runtimeCvWeb.title}
          pitch={runtimeCvWeb.pitch}
          heroImage={runtimeProjects.find((project) => project.image)?.image ?? cvWeb.media?.portrait}
          stackLabel={stackSummary}
          onOpenProjects={() => scrollToSection('projects')}
          onOpenContact={() => scrollToSection('contact')}
        />
        <GlassStatsStrip {metrics} />
        <GlassProjectGrid projects={runtimeProjects} />
        <GlassCvPanel
          cvFileUrl={cvProfile.fileUrl}
          onOpenCvPage={() => navigateTo('/cv')}
        />
        <GlassAboutSkills experiences={runtimeCvWeb.experiences} />
        <GlassContactForm />
      </div>
      <GlassFooter {ownerName} {currentYear} {contactLinks} />
    </div>
  {:else}
    <div class="portfolio-inner">
      {#if !isRoutedPage && currentLayoutTheme.id === 'editorial'}
        <EditorialSideBubbleNav />
      {/if}

      <TopNav
        {ownerName}
        {themes}
        {currentTheme}
        {layoutThemes}
        {currentLayoutTheme}
        showThemeControls={false}
        isCvPage={isRoutedPage}
        onSwitchTheme={nextTheme}
        onSelectTheme={selectTheme}
        onSelectLayoutTheme={selectLayoutTheme}
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
  {/if}
</main>
