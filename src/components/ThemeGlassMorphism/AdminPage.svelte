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
    { ts: '--:--:--', text: 'Obsidian lens online.', type: 'ok' },
    { ts: '--:--:--', text: 'Awaiting secure key...', type: 'info' },
  ]

  if (typeof window !== 'undefined') {
    adminKey = window.localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  }

  function addLog(text, type = 'info') {
    const d = new Date()
    const ts = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':')

    consoleLogs = [...consoleLogs.slice(-69), { ts, text, type }]
  }

  function resetForm() {
    editingProjectId = null
    projectForm = { ...emptyForm }
  }

  function persistAdminKey() {
    if (typeof window === 'undefined') return

    if (adminKey) {
      window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
    } else {
      window.localStorage.removeItem(ADMIN_KEY_STORAGE)
    }
  }

  function handleDisconnect() {
    isConnected = false
    adminKey = ''
    projects = []
    messages = []
    resetForm()
    addLog('Session cleared.', 'warn')

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_KEY_STORAGE)
    }
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
    addLog('Syncing projects and messages...', 'info')

    try {
      const [nextProjects, nextMessages] = await Promise.all([
        adminFetchProjects(adminKey),
        adminFetchContactMessages(adminKey),
      ])

      projects = nextProjects
      messages = nextMessages
      isConnected = true
      addLog(`${nextProjects.length} project(s), ${nextMessages.length} message(s) loaded.`, 'ok')
    } catch (error) {
      isConnected = false
      addLog(error?.message || 'Unable to load admin data.', 'error')
    } finally {
      isLoading = false
    }
  }

  async function handleConnect() {
    if (!adminKey.trim()) {
      addLog('Admin key is required.', 'error')
      return
    }

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
    addLog(`Editing ${project.name}.`, 'info')
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && editingProjectId) {
      resetForm()
    }
  }

  async function handleSubmitProject() {
    isSubmitting = true

    try {
      const payload = normalizeProjectPayload(projectForm)

      if (editingProjectId) {
        await adminUpdateProject(adminKey, editingProjectId, payload)
        addLog(`${payload.name} updated.`, 'ok')
      } else {
        await adminCreateProject(adminKey, payload)
        addLog(`${payload.name} created.`, 'ok')
      }

      resetForm()
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      addLog(error?.message || 'Save operation failed.', 'error')
    } finally {
      isSubmitting = false
    }
  }

  async function handleDeleteProject(projectId, projectName) {
    if (!confirm(`Delete ${projectName}? This action is irreversible.`)) {
      return
    }

    try {
      await adminDeleteProject(adminKey, projectId)
      if (editingProjectId === projectId) resetForm()
      addLog(`${projectName} deleted.`, 'warn')
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      addLog(error?.message || 'Delete operation failed.', 'error')
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="gm-admin" aria-labelledby="glass-admin-title">
  <header class="gm-admin-topnav glass-panel">
    <div class="gm-admin-topnav__left">
      <h1 id="glass-admin-title">Obsidian Admin</h1>
      <nav class="gm-admin-links" aria-label="Admin navigation">
        <button type="button" class:active={activeTab === 'projects'} on:click={() => (activeTab = 'projects')}>
          Projects
        </button>
        <button type="button" class:active={activeTab === 'messages'} on:click={() => (activeTab = 'messages')}>
          Messages
        </button>
      </nav>
    </div>

    <div class="gm-admin-topnav__right">
      {#if isConnected}
        <button type="button" class="gm-admin-btn gm-admin-btn--ghost" on:click={handleDisconnect}>
          Sign Out
        </button>
      {/if}
      <button type="button" class="gm-admin-btn gm-admin-btn--ghost" on:click={onOpenHomePage}>
        Back Home
      </button>
    </div>
  </header>

  <aside class="gm-admin-sidebar glass-panel" aria-label="Admin side navigation">
    <div class="gm-admin-sidebar__header">
      <p>System Core</p>
      <span>{isConnected ? 'v2.4.0-stable' : 'offline'}</span>
    </div>

    <div class="gm-admin-sidebar__menu">
      <button type="button" class:active={activeTab === 'projects'} on:click={() => (activeTab = 'projects')}>
        Projects
      </button>
      <button type="button" class:active={activeTab === 'messages'} on:click={() => (activeTab = 'messages')}>
        Messages
      </button>
      <div>Assets</div>
      <div>Settings</div>
    </div>

    <div class="gm-admin-sidebar__footer">
      {#if isConnected}
        <button
          type="button"
          class="gm-admin-btn gm-admin-btn--primary"
          on:click={() => {
            resetForm()
            activeTab = 'projects'
          }}
        >
          New Project
        </button>
      {/if}
    </div>
  </aside>

  <main class="gm-admin-content">
    {#if !isConnected}
      <section class="gm-admin-auth glass-panel">
        <h2>Secure Access</h2>
        <p>Enter your x-admin-key to unlock project and messages controls.</p>

        <div class="gm-admin-console glass-panel" aria-live="polite">
          {#each consoleLogs as log}
            <div class="gm-admin-console__line">
              <span class={`gm-log-${log.type}`}>[{log.ts}]</span>
              <span class={`gm-log-${log.type}`}>&gt; {log.text}</span>
            </div>
          {/each}
        </div>

        <label for="gm-admin-key">Admin key</label>
        <input
          id="gm-admin-key"
          type="password"
          bind:value={adminKey}
          placeholder="Enter admin key"
          autocomplete="off"
          on:keydown={(e) => e.key === 'Enter' && handleConnect()}
        />

        <button type="button" class="gm-admin-btn gm-admin-btn--primary" disabled={isLoading} on:click={handleConnect}>
          {isLoading ? 'Verifying...' : 'Initialize Core'}
        </button>
      </section>

    {:else if activeTab === 'projects'}
      <div class="gm-admin-layout">
        <section class="gm-admin-projects">
          <header>
            <h2>Project Repository</h2>
            <span>{projects.length} active</span>
          </header>

          {#if projects.length === 0}
            <p class="gm-empty glass-panel">No projects found.</p>
          {:else}
            <div class="gm-project-list">
              {#each projects as project (project.id)}
                <article class={`gm-project-card glass-panel ${editingProjectId === project.id ? 'is-editing' : ''}`}>
                  <div class="gm-project-card__main">
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    <small>{project.type} • {project.date}</small>
                  </div>
                  <div class="gm-project-card__actions">
                    <button type="button" on:click={() => handleEditProject(project)}>Edit</button>
                    <button type="button" class="danger" on:click={() => handleDeleteProject(project.id, project.name)}>
                      Delete
                    </button>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </section>

        <aside class="gm-admin-form glass-panel">
          <h2>{editingProjectId ? 'Update Instance' : 'Create New Instance'}</h2>

          <form class="gm-form" on:submit|preventDefault={handleSubmitProject}>
            <label>
              Project Title
              <input type="text" bind:value={projectForm.name} placeholder="e.g. Obsidian Core" />
            </label>

            <div class="gm-form__two">
              <label>
                Launch Date
                <input type="text" bind:value={projectForm.date} placeholder="03/2026" />
              </label>
              <label>
                Type
                <input type="text" bind:value={projectForm.type} placeholder="WebApp" />
              </label>
            </div>

            <label>
              Technical Resume
              <textarea rows="3" bind:value={projectForm.summary} placeholder="Summarize stack architecture..."></textarea>
            </label>

            <label>
              Source URL
              <input type="url" bind:value={projectForm.sourceUrl} placeholder="https://github.com/..." />
            </label>

            <div class="gm-form__two">
              <label>
                Live URL
                <input type="url" bind:value={projectForm.liveUrl} placeholder="https://..." />
              </label>
              <label>
                Image URL
                <input type="text" bind:value={projectForm.imageUrl} placeholder="/images/projects/..." />
              </label>
            </div>

            <details class="gm-form__details">
              <summary>Demo Config</summary>
              <div class="gm-form__two">
                <label>
                  Mode
                  <input type="text" bind:value={projectForm.demoMode} placeholder="live | internal" />
                </label>
                <label>
                  Game
                  <input type="text" bind:value={projectForm.demoGame} placeholder="mini-reflex" />
                </label>
              </div>
              <div class="gm-form__two">
                <label>
                  Path
                  <input type="text" bind:value={projectForm.demoPath} placeholder="/game" />
                </label>
                <label>
                  URL
                  <input type="url" bind:value={projectForm.demoUrl} placeholder="https://..." />
                </label>
              </div>
            </details>

            <div class="gm-form__actions">
              <button type="submit" class="gm-admin-btn gm-admin-btn--primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingProjectId ? 'Update Instance' : 'Initialize Core'}
              </button>
              <button type="button" class="gm-admin-btn gm-admin-btn--ghost" on:click={resetForm}>
                {editingProjectId ? 'Cancel' : 'Clear'}
              </button>
            </div>
          </form>
        </aside>
      </div>

    {:else if activeTab === 'messages'}
      <section class="gm-full-messages">
        <header>
          <h2>Inbound Transmissions</h2>
          <button type="button" class="gm-admin-btn gm-admin-btn--ghost" on:click={loadAdminData} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {#if messages.length === 0}
          <p class="gm-empty glass-panel">No messages for now.</p>
        {:else}
          <div class="gm-message-grid">
            {#each messages as message}
              <article class="glass-panel gm-message-card">
                <div>
                  <h3>{message.name}</h3>
                  <a href="mailto:{message.email}">{message.email}</a>
                </div>
                {#if message.createdAt}
                  <time>{message.createdAt}</time>
                {/if}
                <p>{message.message}</p>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </main>
</section>

<style>
  .gm-admin {
    min-height: 100vh;
    color: #e5e2e1;
    padding-top: 4.6rem;
    background:
      radial-gradient(circle at 4% 8%, rgba(0, 242, 255, 0.12), transparent 40%),
      radial-gradient(circle at 96% 94%, rgba(191, 90, 242, 0.1), transparent 42%),
      #0a0a0a;
  }

  .gm-admin-topnav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    height: 4.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }

  .gm-admin-topnav__left {
    display: flex;
    align-items: center;
    gap: 1.2rem;
  }

  .gm-admin-topnav__left h1 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    background: linear-gradient(120deg, #00f2ff, #bf5af2);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .gm-admin-links {
    display: none;
    gap: 0.5rem;
  }

  .gm-admin-links button,
  .gm-admin-sidebar__menu button,
  .gm-admin-sidebar__menu div {
    border: none;
    background: transparent;
    color: #8d9aa6;
    font-size: 0.82rem;
    font-family: 'Inter', sans-serif;
    padding: 0.45rem 0.65rem;
    border-radius: 0.55rem;
    text-align: left;
  }

  .gm-admin-links button:hover,
  .gm-admin-sidebar__menu button:hover,
  .gm-admin-links button.active,
  .gm-admin-sidebar__menu button.active {
    color: #d5fcff;
    background: rgba(0, 242, 255, 0.1);
  }

  .gm-admin-topnav__right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .gm-admin-sidebar {
    position: fixed;
    top: 4.6rem;
    left: 0;
    bottom: 0;
    width: 16rem;
    z-index: 30;
    display: none;
    flex-direction: column;
    border-left: 0;
    border-bottom: 0;
    border-top: 0;
    border-radius: 0;
    padding: 1.2rem 0.8rem;
  }

  .gm-admin-sidebar__header {
    padding: 0.5rem 0.75rem;
  }

  .gm-admin-sidebar__header p {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    color: #e8f9ff;
    font-size: 1rem;
    font-weight: 700;
  }

  .gm-admin-sidebar__header span {
    color: #6d7782;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.11em;
  }

  .gm-admin-sidebar__menu {
    display: grid;
    gap: 0.25rem;
    margin-top: 1rem;
  }

  .gm-admin-sidebar__menu div {
    opacity: 0.45;
    cursor: default;
  }

  .gm-admin-sidebar__footer {
    margin-top: auto;
    padding: 0.8rem;
  }

  .gm-admin-content {
    max-width: 82rem;
    margin: 0 auto;
    padding: 1rem;
    display: grid;
    gap: 1rem;
  }

  .gm-admin-auth {
    max-width: 38rem;
    margin: 2rem auto;
    padding: 1.2rem;
    display: grid;
    gap: 0.75rem;
  }

  .gm-admin-auth h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem;
    color: #f6fcff;
  }

  .gm-admin-auth p {
    margin: 0;
    color: #95a2ad;
  }

  .gm-admin-auth label {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #90a2b1;
  }

  .gm-admin-auth input,
  .gm-form input,
  .gm-form textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 0;
    border-bottom: 2px solid rgba(255, 255, 255, 0.11);
    color: #e5e2e1;
    padding: 0.66rem 0.4rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    outline: none;
  }

  .gm-admin-auth input:focus,
  .gm-form input:focus,
  .gm-form textarea:focus {
    border-bottom-color: #00f2ff;
  }

  .gm-admin-console {
    max-height: 10rem;
    overflow: auto;
    padding: 0.7rem;
  }

  .gm-admin-console__line {
    display: flex;
    gap: 0.45rem;
    margin-bottom: 0.3rem;
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 0.72rem;
  }

  .gm-log-info { color: #a2adb8; }
  .gm-log-ok { color: #00f2ff; }
  .gm-log-warn { color: #e9b3ff; }
  .gm-log-error { color: #ffb4ab; }

  .gm-admin-layout {
    display: grid;
    gap: 1rem;
  }

  .gm-admin-projects,
  .gm-admin-form,
  .gm-full-messages {
    display: grid;
    gap: 0.8rem;
  }

  .gm-admin-projects > header,
  .gm-full-messages > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .gm-admin-projects h2,
  .gm-admin-form h2,
  .gm-full-messages h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem;
    color: #f6fcff;
    letter-spacing: -0.02em;
  }

  .gm-admin-projects > header span {
    color: #00f2ff;
    border: 1px solid rgba(0, 242, 255, 0.22);
    border-radius: 999px;
    padding: 0.2rem 0.6rem;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .gm-empty {
    margin: 0;
    padding: 1.2rem;
    border-radius: 0.8rem;
    color: #9ba6b2;
  }

  .gm-project-list {
    display: grid;
    gap: 0.7rem;
  }

  .gm-project-card {
    border-radius: 0.9rem;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 0.75rem;
  }

  .gm-project-card.is-editing {
    border-color: rgba(0, 242, 255, 0.35);
    box-shadow: 0 0 22px rgba(0, 242, 255, 0.08);
  }

  .gm-project-card__main h3 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    color: #fff;
    font-size: 1.08rem;
  }

  .gm-project-card__main p {
    margin: 0.25rem 0;
    color: #9ca7b3;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .gm-project-card__main small {
    color: #7c8691;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .gm-project-card__actions {
    display: grid;
    gap: 0.35rem;
  }

  .gm-project-card__actions button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #dce6ef;
    border-radius: 0.65rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.8rem;
  }

  .gm-project-card__actions button.danger {
    color: #ffb4ab;
    border-color: rgba(255, 180, 171, 0.3);
  }

  .gm-admin-form {
    border-radius: 1rem;
    padding: 1rem;
  }

  .gm-form {
    display: grid;
    gap: 0.8rem;
  }

  .gm-form label {
    display: grid;
    gap: 0.3rem;
    color: #96a3b1;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .gm-form textarea {
    resize: vertical;
    min-height: 5rem;
  }

  .gm-form__two {
    display: grid;
    gap: 0.7rem;
    grid-template-columns: 1fr;
  }

  .gm-form__details {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.75rem;
    padding: 0.65rem;
  }

  .gm-form__details summary {
    cursor: pointer;
    color: #e5e2e1;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .gm-form__actions {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr;
  }

  .gm-message-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .gm-message-card {
    border-radius: 0.95rem;
    padding: 1rem;
    display: grid;
    gap: 0.65rem;
  }

  .gm-message-card h3 {
    margin: 0;
    color: #f1f7ff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
  }

  .gm-message-card a {
    color: #00f2ff;
    font-size: 0.75rem;
    text-decoration: none;
  }

  .gm-message-card time {
    color: #81909d;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .gm-message-card p {
    margin: 0;
    color: #d2dbe4;
    line-height: 1.5;
    border-left: 2px solid rgba(0, 242, 255, 0.35);
    padding-left: 0.7rem;
    white-space: pre-wrap;
  }

  .gm-admin-btn {
    border: 0;
    border-radius: 0.85rem;
    padding: 0.58rem 0.85rem;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 0.76rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .gm-admin-btn--primary {
    background: linear-gradient(120deg, rgba(0, 242, 255, 0.95), rgba(233, 179, 255, 0.95));
    color: #032228;
    box-shadow: 0 0 20px rgba(0, 242, 255, 0.15);
  }

  .gm-admin-btn--ghost {
    background: rgba(255, 255, 255, 0.04);
    color: #d6e2ea;
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .gm-admin-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (min-width: 860px) {
    .gm-admin-links {
      display: flex;
    }

    .gm-admin-content {
      margin-left: 16rem;
      padding: 1.25rem;
    }

    .gm-admin-sidebar {
      display: flex;
    }

    .gm-admin-layout {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    }

    .gm-form__two {
      grid-template-columns: 1fr 1fr;
    }

    .gm-form__actions {
      grid-template-columns: 1fr auto;
    }

    .gm-message-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
