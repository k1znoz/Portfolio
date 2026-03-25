<script>
  import {
    adminCreateProject,
    adminDeleteProject,
    adminFetchContactMessages,
    adminFetchProjects,
    adminUpdateProject,
  } from '../../lib/api-client'

  export let onOpenHomePage = () => {}
  export let onProjectsUpdated = async () => {}

  const ADMIN_KEY_STORAGE = 'portfolio-admin-api-key'

  const emptyForm = {
    date: '',
    name: '',
    type: '',
    summary: '',
    imageUrl: '',
    liveUrl: '',
    sourceUrl: '',
    demoMode: '',
    demoGame: '',
    demoPath: '',
    demoUrl: '',
  }

  let adminKey = ''
  let isConnected = false
  let isLoading = false
  let isSubmitting = false
  let activeTab = 'projects'

  let projects = []
  let messages = []
  let editingProjectId = null
  let projectForm = { ...emptyForm }

  let consoleLogs = [
    { ts: '--:--:--', text: 'BLACKSMITH_OS ready.', type: 'ok' },
    { ts: '--:--:--', text: 'Awaiting forge key...', type: 'info' },
  ]

  if (typeof window !== 'undefined') {
    adminKey = window.localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  }

  function addLog(text, type = 'info') {
    const d = new Date()
    const ts = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':')
    consoleLogs = [...consoleLogs.slice(-49), { ts, text, type }]
  }

  function resetForm() {
    editingProjectId = null
    projectForm = { ...emptyForm }
  }

  function persistAdminKey() {
    if (typeof window === 'undefined') return
    if (adminKey) window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
    else window.localStorage.removeItem(ADMIN_KEY_STORAGE)
  }

  function handleDisconnect() {
    isConnected = false
    adminKey = ''
    projects = []
    messages = []
    resetForm()
    addLog('Forge session ended.', 'warn')
    if (typeof window !== 'undefined') window.localStorage.removeItem(ADMIN_KEY_STORAGE)
  }

  function normalizeProjectPayload(input) {
    const date = String(input.date || '').trim()
    const name = String(input.name || '').trim()
    const type = String(input.type || '').trim()
    const summary = String(input.summary || '').trim()
    const source = String(input.sourceUrl || '').trim()

    if (!date || !name || !type || !summary || !source) {
      throw new Error('Date, name, type, summary and source are required.')
    }

    const payload = {
      date,
      name,
      type,
      summary,
      image: String(input.imageUrl || '').trim() || null,
      links: {
        live: String(input.liveUrl || '').trim() || null,
        source,
      },
      demo: null,
    }

    const demoMode = String(input.demoMode || '').trim()
    if (demoMode) {
      payload.demo = {
        mode: demoMode,
        game: String(input.demoGame || '').trim() || null,
        path: String(input.demoPath || '').trim() || null,
        url: String(input.demoUrl || '').trim() || null,
      }
    }

    return payload
  }

  async function loadAdminData() {
    isLoading = true
    addLog('Loading inventory and comms...', 'info')
    try {
      const [p, m] = await Promise.all([
        adminFetchProjects(adminKey),
        adminFetchContactMessages(adminKey),
      ])
      projects = p
      messages = m
      isConnected = true
      addLog(`Loaded ${p.length} inventory entries / ${m.length} comm logs.`, 'ok')
    } catch (e) {
      isConnected = false
      addLog(e?.message || 'Forge access denied.', 'error')
    } finally {
      isLoading = false
    }
  }

  async function handleConnect() {
    if (!adminKey.trim()) {
      addLog('Forge key required.', 'error')
      return
    }
    addLog('Authenticating...', 'info')
    persistAdminKey()
    await loadAdminData()
  }

  function handleEditProject(project) {
    editingProjectId = project.id
    activeTab = 'projects'
    projectForm = {
      date: project.date || '',
      name: project.name || '',
      type: project.type || '',
      summary: project.summary || '',
      imageUrl: project.image || '',
      liveUrl: project.links?.live || '',
      sourceUrl: project.links?.source || '',
      demoMode: project.demo?.mode || '',
      demoGame: project.demo?.game || '',
      demoPath: project.demo?.path || '',
      demoUrl: project.demo?.url || '',
    }
    addLog(`EDIT > ${project.name}`, 'info')
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && editingProjectId) resetForm()
  }

  async function handleSubmitProject() {
    isSubmitting = true
    try {
      const payload = normalizeProjectPayload(projectForm)
      if (editingProjectId) {
        await adminUpdateProject(adminKey, editingProjectId, payload)
        addLog(`REFORGED > ${payload.name}`, 'ok')
      } else {
        await adminCreateProject(adminKey, payload)
        addLog(`FORGED > ${payload.name}`, 'ok')
      }
      resetForm()
      await loadAdminData()
      await onProjectsUpdated()
    } catch (e) {
      addLog(e?.message || 'Strike failed.', 'error')
    } finally {
      isSubmitting = false
    }
  }

  async function handleDeleteProject(projectId, projectName) {
    if (!confirm(`Delete ${projectName}? This cannot be undone.`)) return
    try {
      await adminDeleteProject(adminKey, projectId)
      if (editingProjectId === projectId) resetForm()
      addLog(`MELTED > ${projectName}`, 'warn')
      await loadAdminData()
      await onProjectsUpdated()
    } catch (e) {
      addLog(e?.message || 'Delete failed.', 'error')
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="iron-admin">
  <header class="iron-admin-topbar">
    <div class="iron-admin-topbar__left">
      <span class="iron-admin-brand">BLACKSMITH_OS</span>
      <nav class="iron-admin-topnav" aria-label="Admin navigation">
        <button
          type="button"
          class={`iron-admin-topnav__item ${activeTab === 'projects' ? 'is-active' : ''}`}
          on:click={() => (activeTab = 'projects')}
        >
          FORGE
        </button>
        <button
          type="button"
          class={`iron-admin-topnav__item ${activeTab === 'messages' ? 'is-active' : ''}`}
          on:click={() => (activeTab = 'messages')}
        >
          MESSAGES
        </button>
      </nav>
    </div>
    <button type="button" class="iron-admin-home" on:click={onOpenHomePage}>
      EXIT_FORGE
    </button>
  </header>

  <aside class="iron-admin-side" aria-label="Forge control panels">
    <div class="iron-admin-side__header">
      <h1>THE_ANVIL</h1>
      <p>{isConnected ? 'PORTFOLIO_ROOT_ONLINE' : 'PORTFOLIO_ROOT_OFFLINE'}</p>
    </div>

    <nav class="iron-admin-side__nav" aria-label="Admin tabs">
      <button
        type="button"
        class={`iron-admin-side__item ${activeTab === 'projects' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'projects')}
      >
        PROJECT_MANAGE
      </button>
      <button
        type="button"
        class={`iron-admin-side__item ${activeTab === 'messages' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'messages')}
      >
        COMM_CENTRAL
      </button>
      <div class="iron-admin-side__item is-faded">ANALYTICS</div>
      <div class="iron-admin-side__item is-faded">SYSTEM_HEAT</div>
    </nav>

    <div class="iron-admin-side__footer">
      {#if isConnected}
        <button
          type="button"
          class="iron-admin-strike"
          on:click={() => {
            resetForm()
            activeTab = 'projects'
          }}
        >
          STRIKE_NEW_PROJECT
        </button>
      {/if}
      {#if isConnected}
        <button type="button" class="iron-admin-logout" on:click={handleDisconnect}>EXTINGUISH</button>
      {/if}
    </div>
  </aside>

  <main class="iron-admin-main">
    {#if !isConnected}
      <section class="iron-panel iron-auth">
        <h2 class="iron-title">FORGE_AUTH</h2>

        <div class="iron-console">
          {#each consoleLogs as log}
            <div class="iron-console__line">
              <span class={`iron-log-${log.type}`}>[{log.ts}]</span>
              <span class={`iron-log-${log.type}`}>&gt; {log.text}</span>
            </div>
          {/each}
          <span class="iron-cursor">_</span>
        </div>

        <label class="iron-label" for="iron-admin-key">FORGE_KEY</label>
        <input
          id="iron-admin-key"
          type="password"
          bind:value={adminKey}
          class="iron-input"
          placeholder="ENTER_FORGE_KEY"
          on:keydown={(e) => e.key === 'Enter' && handleConnect()}
        />

        <button type="button" class="iron-submit" on:click={handleConnect} disabled={isLoading}>
          {isLoading ? 'VERIFYING...' : 'INITIATE_FORGE'}
        </button>
      </section>

    {:else if activeTab === 'projects'}
      <section class="iron-header-row">
        <div>
          <h2 class="iron-title">FORGE_CONTROL</h2>
          <p class="iron-subtitle">Session inventory and workpiece operations.</p>
        </div>
        <div class="iron-kpis">
          <div class="iron-kpi-box">
            <span>CORE_TEMP</span>
            <strong>1240C</strong>
          </div>
          <div class="iron-kpi-box">
            <span>OUTPUT_LOAD</span>
            <strong>{projects.length * 4}%</strong>
          </div>
        </div>
      </section>

      <section class="iron-stats-grid">
        <article class="iron-stat">
          <span>ACTIVE_INVENTORY</span>
          <strong>{projects.length}</strong>
        </article>
        <article class="iron-stat">
          <span>COMM_LOGS</span>
          <strong>{messages.length}</strong>
        </article>
        <article class="iron-stat">
          <span>LIVE_FORGES</span>
          <strong>{projects.filter((p) => p.links?.live).length}</strong>
        </article>
      </section>

      <section class="iron-layout-grid">
        <div class="iron-panel">
          <header class="iron-panel__header">
            <h3>ACTIVE_INVENTORY</h3>
            <span>TOTAL: {projects.length}</span>
          </header>

          {#if projects.length === 0}
            <p class="iron-empty">NO_WORKPIECES_FOUND</p>
          {:else}
            <div class="iron-project-list">
              {#each projects as project (project.id)}
                <article class={`iron-project ${editingProjectId === project.id ? 'is-editing' : ''}`}>
                  <div class="iron-project__content">
                    <h4>{project.name}</h4>
                    <p>{project.type} / {project.date}</p>
                  </div>
                  <div class="iron-project__actions">
                    <button type="button" on:click={() => handleEditProject(project)}>EDIT</button>
                    <button type="button" class="is-danger" on:click={() => handleDeleteProject(project.id, project.name)}>MELT</button>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </div>

        <div class="iron-stack">
          <section class="iron-panel">
            <header class="iron-panel__header">
              <h3>{editingProjectId ? 'REFORGE_WORKPIECE' : 'FORGE_WORKPIECE'}</h3>
              <span>CMD</span>
            </header>

            <form class="iron-form" on:submit|preventDefault={handleSubmitProject}>
              <div class="iron-form__row">
                <div>
                  <label class="iron-label" for="iron-name">NAME *</label>
                  <input id="iron-name" class="iron-input" type="text" bind:value={projectForm.name} />
                </div>
                <div>
                  <label class="iron-label" for="iron-date">DATE *</label>
                  <input id="iron-date" class="iron-input" type="text" bind:value={projectForm.date} />
                </div>
              </div>

              <div class="iron-form__row">
                <div>
                  <label class="iron-label" for="iron-type">TYPE *</label>
                  <input id="iron-type" class="iron-input" type="text" bind:value={projectForm.type} />
                </div>
                <div>
                  <label class="iron-label" for="iron-source">SOURCE *</label>
                  <input id="iron-source" class="iron-input" type="url" bind:value={projectForm.sourceUrl} />
                </div>
              </div>

              <div>
                <label class="iron-label" for="iron-summary">SUMMARY *</label>
                <textarea id="iron-summary" class="iron-input" rows="2" bind:value={projectForm.summary}></textarea>
              </div>

              <div class="iron-form__row">
                <div>
                  <label class="iron-label" for="iron-image">IMAGE</label>
                  <input id="iron-image" class="iron-input" type="text" bind:value={projectForm.imageUrl} />
                </div>
                <div>
                  <label class="iron-label" for="iron-live">LIVE</label>
                  <input id="iron-live" class="iron-input" type="url" bind:value={projectForm.liveUrl} />
                </div>
              </div>

              <details class="iron-details">
                <summary>DEMO_CONFIG</summary>
                <div class="iron-form__row">
                  <div>
                    <label class="iron-label" for="iron-demo-mode">MODE</label>
                    <input id="iron-demo-mode" class="iron-input" type="text" bind:value={projectForm.demoMode} />
                  </div>
                  <div>
                    <label class="iron-label" for="iron-demo-game">GAME</label>
                    <input id="iron-demo-game" class="iron-input" type="text" bind:value={projectForm.demoGame} />
                  </div>
                </div>
                <div class="iron-form__row">
                  <div>
                    <label class="iron-label" for="iron-demo-path">PATH</label>
                    <input id="iron-demo-path" class="iron-input" type="text" bind:value={projectForm.demoPath} />
                  </div>
                  <div>
                    <label class="iron-label" for="iron-demo-url">URL</label>
                    <input id="iron-demo-url" class="iron-input" type="url" bind:value={projectForm.demoUrl} />
                  </div>
                </div>
              </details>

              <div class="iron-form__actions">
                <button type="submit" class="iron-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'STRIKING...' : editingProjectId ? 'REFORGE' : 'INITIATE_STRIKE'}
                </button>
                <button type="button" class="iron-clear" on:click={resetForm}>
                  {editingProjectId ? 'CANCEL' : 'CLEAR'}
                </button>
              </div>
            </form>
          </section>

          <section class="iron-panel iron-console-panel">
            <header class="iron-panel__header">
              <h3>SYSTEM_LOGS</h3>
              <button type="button" class="iron-refresh" on:click={loadAdminData} disabled={isLoading}>REFRESH</button>
            </header>
            <div class="iron-console is-large">
              {#each consoleLogs as log}
                <div class="iron-console__line">
                  <span class={`iron-log-${log.type}`}>[{log.ts}]</span>
                  <span class={`iron-log-${log.type}`}>&gt; {log.text}</span>
                </div>
              {/each}
            </div>
          </section>
        </div>
      </section>

    {:else if activeTab === 'messages'}
      <section class="iron-header-row">
        <div>
          <h2 class="iron-title">COMMS_CENTRAL</h2>
          <p class="iron-subtitle">Inbound messages from contact channel.</p>
        </div>
        <button type="button" class="iron-refresh" on:click={loadAdminData} disabled={isLoading}>
          {isLoading ? 'REFRESHING...' : 'REFRESH'}
        </button>
      </section>

      {#if messages.length === 0}
        <section class="iron-panel">
          <p class="iron-empty">NO_SIGNAL_DETECTED</p>
        </section>
      {:else}
        <section class="iron-message-grid">
          {#each messages as message}
            <article class="iron-message">
              <header>
                <div>
                  <h3>{message.name}</h3>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                {#if message.createdAt}
                  <time>{message.createdAt}</time>
                {/if}
              </header>
              <p>{message.message}</p>
            </article>
          {/each}
        </section>
      {/if}
    {/if}
  </main>
</div>

<style>
  .iron-admin {
    min-height: 100vh;
    background: #131313;
    color: #e5e2e1;
    font-family: 'Inter', sans-serif;
  }

  .iron-admin-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    height: 4.5rem;
    background: #131313;
    border-bottom: 4px solid #5c4037;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    box-shadow: 0 0 20px rgba(255, 181, 158, 0.05);
  }

  .iron-admin-topbar__left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .iron-admin-brand {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    color: #ffb59e;
    letter-spacing: -0.04em;
  }

  .iron-admin-topnav {
    display: none;
    gap: 1rem;
  }

  .iron-admin-topnav__item {
    border: 0;
    background: transparent;
    color: #c8c6c6;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.35rem 0.15rem;
    border-bottom: 3px solid transparent;
  }

  .iron-admin-topnav__item:hover {
    color: #ffb59e;
  }

  .iron-admin-topnav__item.is-active {
    color: #ff571a;
    border-bottom-color: #ff571a;
  }

  .iron-admin-home {
    border: 2px solid #5c4037;
    background: #0e0e0e;
    color: #c8c6c6;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.45rem 0.8rem;
  }

  .iron-admin-home:hover {
    border-color: #ffb59e;
    color: #ffb59e;
  }

  .iron-admin-side {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 35;
    width: 16rem;
    height: 100vh;
    background: #0e0e0e;
    border-right: 4px solid #5c4037;
    padding-top: 4.5rem;
    display: none;
    flex-direction: column;
  }

  .iron-admin-side__header {
    padding: 1.5rem;
  }

  .iron-admin-side__header h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    color: #ffb59e;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .iron-admin-side__header p {
    margin: 0.25rem 0 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.5;
  }

  .iron-admin-side__nav {
    display: flex;
    flex-direction: column;
    margin-top: 0.5rem;
  }

  .iron-admin-side__item {
    border: 0;
    background: transparent;
    color: #c8c6c6;
    text-align: left;
    padding: 1rem 1.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-left: 4px solid transparent;
  }

  .iron-admin-side__item:hover {
    background: #393939;
    color: #ffb59e;
  }

  .iron-admin-side__item.is-active {
    background: #201f1f;
    color: #ffb59e;
    border-left-color: #ff571a;
    transform: translateX(4px);
  }

  .iron-admin-side__item.is-faded {
    opacity: 0.4;
    pointer-events: none;
  }

  .iron-admin-side__footer {
    margin-top: auto;
    border-top: 2px solid #5c4037;
    padding: 1.25rem;
  }

  .iron-admin-strike,
  .iron-admin-logout {
    width: 100%;
    border: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.85rem 0.75rem;
  }

  .iron-admin-strike {
    background: #ff571a;
    color: #521300;
    margin-bottom: 0.65rem;
  }

  .iron-admin-logout {
    background: transparent;
    border: 2px solid #5c4037;
    color: #ffb4ac;
  }

  .iron-admin-main {
    padding: 6rem 1rem 2rem;
    max-width: 88rem;
    margin: 0 auto;
  }

  .iron-panel {
    background: #201f1f;
    border: 2px solid #5c4037;
    padding: 1rem;
  }

  .iron-auth {
    max-width: 34rem;
    margin: 2rem auto;
  }

  .iron-title {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.8rem, 5vw, 3rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    color: #ffb59e;
  }

  .iron-subtitle {
    margin: 0.4rem 0 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.6;
  }

  .iron-console {
    margin: 1rem 0;
    background: #0e0e0e;
    border: 2px solid #5c4037;
    padding: 0.75rem;
    max-height: 9rem;
    overflow: auto;
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 0.72rem;
  }

  .iron-console.is-large {
    max-height: 13rem;
  }

  .iron-console__line {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
  }

  .iron-log-info {
    color: #c8c6c6;
  }

  .iron-log-ok {
    color: #ffb59e;
  }

  .iron-log-warn {
    color: #ff571a;
  }

  .iron-log-error {
    color: #ff6d65;
  }

  .iron-cursor {
    color: #ff571a;
    border-right: 3px solid #ff571a;
    padding-right: 0.2rem;
    animation: blink 1s step-end infinite;
  }

  .iron-label {
    display: block;
    margin-bottom: 0.35rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.7;
  }

  .iron-input {
    width: 100%;
    border: 0;
    border-bottom: 2px solid #5c4037;
    background: #131313;
    color: #e5e2e1;
    padding: 0.58rem 0.5rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .iron-input:focus {
    outline: none;
    border-bottom-color: #ffb59e;
  }

  .iron-submit,
  .iron-clear,
  .iron-refresh {
    border: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.75rem 0.9rem;
  }

  .iron-submit {
    flex: 1;
    background: linear-gradient(135deg, #ffb59e, #ff571a);
    color: #521300;
  }

  .iron-clear,
  .iron-refresh {
    background: transparent;
    border: 2px solid #5c4037;
    color: #c8c6c6;
  }

  .iron-header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .iron-kpis {
    display: flex;
    gap: 0.75rem;
  }

  .iron-kpi-box {
    background: #201f1f;
    border: 2px solid #5c4037;
    padding: 0.75rem 0.95rem;
    min-width: 7.5rem;
  }

  .iron-kpi-box span {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c8c6c6;
    opacity: 0.65;
  }

  .iron-kpi-box strong {
    display: block;
    margin-top: 0.25rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    color: #ff571a;
  }

  .iron-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .iron-stat {
    background: #201f1f;
    border: 2px solid #5c4037;
    padding: 0.9rem;
  }

  .iron-stat span {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c8c6c6;
  }

  .iron-stat strong {
    display: block;
    margin-top: 0.3rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem;
    color: #ffb59e;
  }

  .iron-layout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 1rem;
  }

  .iron-stack {
    display: grid;
    gap: 1rem;
  }

  .iron-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    margin-bottom: 0.85rem;
  }

  .iron-panel__header h3,
  .iron-panel__header span {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .iron-panel__header h3 {
    color: #ffb59e;
  }

  .iron-panel__header span {
    color: #c8c6c6;
    opacity: 0.6;
  }

  .iron-empty {
    margin: 0;
    padding: 1.2rem;
    border: 2px dashed #5c4037;
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.6;
  }

  .iron-project-list {
    display: grid;
    gap: 0.7rem;
    max-height: 30rem;
    overflow: auto;
  }

  .iron-project {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    border: 2px solid #5c4037;
    border-left: 8px solid #ff571a;
    background: #131313;
    padding: 0.8rem;
  }

  .iron-project.is-editing {
    border-left-color: #ffb59e;
    background: #201f1f;
  }

  .iron-project__content h4 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.86rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #ffb59e;
  }

  .iron-project__content p {
    margin: 0.25rem 0 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.7;
  }

  .iron-project__actions {
    display: flex;
    gap: 0.45rem;
  }

  .iron-project__actions button {
    border: 2px solid #5c4037;
    background: transparent;
    color: #c8c6c6;
    padding: 0.45rem 0.55rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .iron-project__actions button:hover {
    border-color: #ffb59e;
    color: #ffb59e;
  }

  .iron-project__actions button.is-danger:hover {
    border-color: #ff6d65;
    color: #ff6d65;
  }

  .iron-form {
    display: grid;
    gap: 0.25rem;
  }

  .iron-form__row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .iron-details {
    border: 2px solid #5c4037;
    padding: 0.5rem;
    margin-bottom: 0.7rem;
  }

  .iron-details summary {
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ffb59e;
    margin-bottom: 0.55rem;
  }

  .iron-form__actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .iron-message-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .iron-message {
    background: #201f1f;
    border: 2px solid #5c4037;
    padding: 1rem;
  }

  .iron-message header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 0.6rem;
    margin-bottom: 0.65rem;
  }

  .iron-message h3 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.8rem;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffb59e;
  }

  .iron-message a {
    color: #c8c6c6;
    font-size: 0.68rem;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    opacity: 0.8;
  }

  .iron-message time {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #c8c6c6;
    opacity: 0.5;
  }

  .iron-message p {
    margin: 0;
    border-left: 2px solid #ff571a;
    padding-left: 0.65rem;
    font-size: 0.86rem;
    color: #e5e2e1;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  @media (min-width: 860px) {
    .iron-admin-topnav {
      display: flex;
    }
  }

  @media (min-width: 1024px) {
    .iron-admin-main {
      margin-left: 16rem;
      max-width: none;
      padding: 6rem 1.25rem 2rem;
    }

    .iron-admin-side {
      display: flex;
    }
  }

  @media (max-width: 940px) {
    .iron-layout-grid {
      grid-template-columns: 1fr;
    }

    .iron-stats-grid {
      grid-template-columns: 1fr;
    }

    .iron-message-grid {
      grid-template-columns: 1fr;
    }

    .iron-kpis {
      width: 100%;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 560px) {
    .iron-admin-topbar {
      padding: 0 0.8rem;
    }

    .iron-admin-brand {
      font-size: 1rem;
    }

    .iron-admin-home {
      font-size: 0.56rem;
      padding: 0.35rem 0.5rem;
    }

    .iron-form__row {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .iron-form__actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
