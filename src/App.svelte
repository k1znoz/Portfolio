<script>
  import { onMount } from 'svelte'

  import AboutSection from './components/AboutSection.svelte'
  import ContactSection from './components/ContactSection.svelte'
  import CvPage from './components/CvPage.svelte'
  import CvShowcase from './components/CvShowcase.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import MetricsPanel from './components/MetricsPanel.svelte'
  import ProjectsSection from './components/ProjectsSection.svelte'
  import TopNav from './components/TopNav.svelte'
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
  let runtimeStack = [...baseStack]
  let runtimeCvWeb = {
    ...cvWeb,
    skills: [...cvWeb.skills],
  }

  $: currentTheme = themes[themeIndex]
  $: isCvPage = currentPath === '/cv'
  $: motion = drifts[switchCount % drifts.length]
  $: currentYear = new Date().getFullYear()
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

  onMount(() => {
    const normalized = window.location.pathname === '/cv' ? '/cv' : '/'
    currentPath = normalized

    refreshLanguageOrder()

    if (window.location.pathname !== normalized) {
      window.history.replaceState({}, '', normalized)
    }

    const onPopState = () => {
      currentPath = window.location.pathname === '/cv' ? '/cv' : '/'
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  })

  function navigateTo(path) {
    const normalized = path === '/cv' ? '/cv' : '/'

    if (typeof window !== 'undefined' && window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized)
    }

    currentPath = normalized
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function nextTheme() {
    if (isSwitching) return

    isSwitching = true
    themeIndex = (themeIndex - 1 + themes.length) % themes.length
    switchCount += 1

    setTimeout(() => {
      isSwitching = false
    }, 850)
  }

  function selectTheme(themeId) {
    if (isSwitching) return

    const targetIndex = themes.findIndex((theme) => theme.id === themeId)
    if (targetIndex === -1 || targetIndex === themeIndex) return

    isSwitching = true
    themeIndex = targetIndex
    switchCount += 1

    setTimeout(() => {
      isSwitching = false
    }, 850)
  }
</script>

<main
  class={`portfolio-shell theme-${currentTheme.id} ${isSwitching ? 'is-switching' : ''}`}
  style={`--drift-x:${motion.x};--drift-y:${motion.y};--drift-r:${motion.r};`}
>
  <div class="ambience-glow" aria-hidden="true"></div>

  <div class="portfolio-inner">
    <TopNav
      {ownerName}
      {themes}
      {currentTheme}
      {isCvPage}
      onSwitchTheme={nextTheme}
      onSelectTheme={selectTheme}
      onOpenCvPage={() => navigateTo('/cv')}
      onOpenHomePage={() => navigateTo('/')}
    />

    {#if isCvPage}
      <CvPage {cvProfile} cvWeb={runtimeCvWeb} {currentTheme} />
    {:else}
      <HeroSection {currentTheme} stack={runtimeStack} />
      <MetricsPanel {metrics} />
      <CvShowcase {cvProfile} onOpenCvPage={() => navigateTo('/cv')} />
      <ProjectsSection {projects} />
      <AboutSection {services} />
      <ContactSection {contactLinks} />
    {/if}

    <footer class="panel site-footer">
      <p>© {currentYear} {ownerName}. Portfolio evolutif construit avec Svelte.</p>
      <a href="#hero">Retour en haut</a>
    </footer>
  </div>
</main>
