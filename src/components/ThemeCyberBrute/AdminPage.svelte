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
    { ts: '--:--:--', text: 'ROOT session initialized.', type: 'ok' },
    { ts: '--:--:--', text: 'Awaiting authentication...', type: 'info' },
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
    addLog('Session terminated. Credentials cleared.', 'warn')
    if (typeof window !== 'undefined') window.localStorage.removeItem(ADMIN_KEY_STORAGE)
  }

  function normalizeProjectPayload(input) {
    const date = String(input.date || '').trim()
    const name = String(input.name || '').trim()
    const type = String(input.type || '').trim()
    const summary = String(input.summary || '').trim()
    const source = String(input.sourceUrl || '').trim()

    if (!date || !name || !type || !summary || !source) {
      throw new Error('Date, nom, type, resume et source sont obligatoires.')
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
    addLog('Fetching admin data...', 'info')
    try {
      const [p, m] = await Promise.all([
        adminFetchProjects(adminKey),
        adminFetchContactMessages(adminKey),
      ])
      projects = p
      messages = m
      isConnected = true
      addLog(`${p.length} project(s) · ${m.length} message(s) loaded. [OK]`, 'ok')
    } catch (e) {
      isConnected = false
      addLog(e?.message || 'Connection failed.', 'error')
    } finally {
      isLoading = false
    }
  }

  async function handleConnect() {
    if (!adminKey.trim()) {
      addLog('API key required.', 'error')
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
        addLog(`UPDATED > ${payload.name} [OK]`, 'ok')
      } else {
        await adminCreateProject(adminKey, payload)
        addLog(`CREATED > ${payload.name} [OK]`, 'ok')
      }
      resetForm()
      await loadAdminData()
      await onProjectsUpdated()
    } catch (e) {
      addLog(e?.message || 'Save failed.', 'error')
    } finally {
      isSubmitting = false
    }
  }

  async function handleDeleteProject(projectId, projectName) {
    if (!confirm(`Supprimer "${projectName}" ? Cette action est irreversible.`)) return
    try {
      await adminDeleteProject(adminKey, projectId)
      if (editingProjectId === projectId) resetForm()
      addLog(`DELETED > ${projectName} [OK]`, 'warn')
      await loadAdminData()
      await onProjectsUpdated()
    } catch (e) {
      addLog(e?.message || 'Delete failed.', 'error')
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="cyber-admin">
  <!-- Scanline CRT overlay -->
  <div class="scanline-crt" aria-hidden="true"></div>

  <!-- ── TopAppBar ───────────────────────────────────────────────────────── -->
  <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-[#0e0e0e] border-b-2 border-[#484848]">
    <div
      class="text-xl font-black text-[#ff8f73] tracking-[-0.05em] uppercase select-none"
      style="font-family: 'Space Grotesk', sans-serif;"
    >
      SVELTE_CORE_ADMIN
    </div>

    <nav class="hidden md:flex items-center gap-8 h-full" aria-label="Navigation admin">
      <button
        type="button"
        class={`admin-nav-tab ${activeTab === 'projects' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'projects')}
      >
        PROJETS
      </button>
      <button
        type="button"
        class={`admin-nav-tab ${activeTab === 'messages' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'messages')}
      >
        MESSAGES
      </button>
      <span class="admin-nav-tab opacity-30 cursor-default">SYS_STATUS</span>
    </nav>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="admin-icon-btn p-2 hover:bg-[#1f1f1f] text-[#e2e2e2] transition-none"
        on:click={onOpenHomePage}
        title="Retour portfolio"
        aria-label="Retour portfolio"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
      </button>
      {#if isConnected}
        <button
          type="button"
          class="admin-icon-btn p-2 hover:bg-[#1f1f1f] text-[#ff8f73] transition-none"
          on:click={handleDisconnect}
          title="Deconnexion"
          aria-label="Deconnexion"
        >
          <span class="material-symbols-outlined text-base">logout</span>
        </button>
      {/if}
      <div
        class="h-8 w-8 bg-[#131313] border border-[#484848] flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-[#ff8f73] text-sm">terminal</span>
      </div>
    </div>
  </header>

  <!-- ── SideNavBar ─────────────────────────────────────────────────────── -->
  <aside
    class="fixed left-0 top-0 h-full z-40 flex flex-col w-64 bg-[#131313] border-r-2 border-[#484848] pt-20"
    aria-label="Navigation sections admin"
  >
    <div class="px-6 mb-8">
      <div
        class="text-xs font-black text-[#e2e2e2] uppercase mb-1 tracking-widest"
        style="font-family: 'Space Grotesk', sans-serif;"
      >
        ROOT_ACCESS
      </div>
      <div class="font-mono text-[10px] tracking-widest" style={`color: ${isConnected ? '#9cff93' : '#ff6e84'};`}>
        {isConnected ? '[CONNECTED]' : '[OFFLINE]'}
      </div>
    </div>

    <nav class="flex-1 px-2" aria-label="Onglets admin">
      <button
        type="button"
        class={`admin-side-item ${activeTab === 'projects' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'projects')}
      >
        <span
          class="material-symbols-outlined text-base"
          style={activeTab === 'projects' ? "font-variation-settings: 'FILL' 1;" : ''}
        >folder_special</span>
        PROJETS
        {#if isConnected && projects.length > 0}
          <span class="ml-auto text-[10px] font-black px-1.5 py-0.5 bg-current text-[#0e0e0e]"
            style={activeTab === 'projects' ? '' : 'background:#484848;color:#e2e2e2;'}
          >{projects.length}</span>
        {/if}
      </button>

      <button
        type="button"
        class={`admin-side-item ${activeTab === 'messages' ? 'is-active' : ''}`}
        on:click={() => (activeTab = 'messages')}
      >
        <span
          class="material-symbols-outlined text-base"
          style={activeTab === 'messages' ? "font-variation-settings: 'FILL' 1;" : ''}
        >mail</span>
        MESSAGES
        {#if isConnected && messages.length > 0}
          <span class="ml-auto text-[10px] font-black px-1.5 py-0.5"
            style={activeTab === 'messages' ? 'background:#0e0e0e;color:#ff8f73;' : 'background:#ff8f73;color:#0e0e0e;'}
          >{messages.length}</span>
        {/if}
      </button>

      <!-- Decorative / future entries -->
      <div class="admin-side-item opacity-30 cursor-not-allowed">
        <span class="material-symbols-outlined text-base">monitoring</span>
        ANALYTICS
      </div>
      <div class="admin-side-item opacity-30 cursor-not-allowed">
        <span class="material-symbols-outlined text-base">rocket_launch</span>
        DEPLOY
      </div>
    </nav>

    <div class="px-4 pb-4">
      {#if isConnected}
        <button
          type="button"
          class="w-full py-3 mb-3 bg-[#ff8f73] text-[#0e0e0e] font-black text-xs uppercase tracking-widest hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] transition-none"
          style="font-family: 'Space Grotesk', sans-serif;"
          on:click={() => {
            resetForm()
            activeTab = 'projects'
          }}
        >
          + NEW_PROJECT
        </button>
      {/if}
      <div class="border-t border-[#262626] pt-3">
        <button
          type="button"
          class="admin-utility-btn w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#1f1f1f] text-[#e2e2e2] text-xs uppercase tracking-widest transition-none"
          style="font-family: 'Space Grotesk', sans-serif;"
          on:click={onOpenHomePage}
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          PORTFOLIO
        </button>
        {#if isConnected}
          <button
            type="button"
            class="admin-utility-btn w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#1f1f1f] text-[#e2e2e2] text-xs uppercase tracking-widest transition-none"
            style="font-family: 'Space Grotesk', sans-serif;"
            on:click={handleDisconnect}
          >
            <span class="material-symbols-outlined text-sm">logout</span>
            LOGOUT
          </button>
        {/if}
      </div>
    </div>
  </aside>

  <!-- ── Main ───────────────────────────────────────────────────────────── -->
  <main class="admin-main">
    <div class="p-6 lg:p-8">

      <!-- ── AUTH panel ─────────────────────────────────────────────────── -->
      {#if !isConnected}
        <div class="max-w-xl mt-8">
          <h1 class="admin-page-title mb-8">ACCESS_CONTROL</h1>
          <div class="admin-card relative">
            <div class="admin-card-label">CMD: AUTHENTICATE</div>
            <!-- Console -->
            <div
              class="bg-black border border-[#262626] p-4 mb-5 h-32 overflow-y-auto font-mono text-xs cyber-scrollbar"
            >
              {#each consoleLogs as log}
                <div class="flex gap-2 mb-1">
                  <span class={`log-ts log-${log.type}`}>[{log.ts}]</span>
                  <span class={`log-text log-${log.type}`}>&gt; {log.text}</span>
                </div>
              {/each}
              <span class="text-[#ff8f73] border-r-4 border-[#ff8f73] pr-0.5 animate-pulse">_</span>
            </div>
            <!-- Key input -->
            <label
              class="block text-[10px] font-black uppercase mb-1.5 text-[#ababab] tracking-widest"
              style="font-family: 'Space Grotesk', sans-serif;"
              for="admin-key-input"
            >
              API_KEY
            </label>
            <input
              id="admin-key-input"
              type="password"
              bind:value={adminKey}
              placeholder="ENTER_ADMIN_KEY"
              autocomplete="off"
              class="cyber-input w-full mb-4"
              on:keydown={(e) => e.key === 'Enter' && handleConnect()}
            />
            <button
              type="button"
              class="w-full bg-[#ff8f73] text-[#0e0e0e] font-black py-3 uppercase tracking-widest text-sm hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] transition-none disabled:opacity-50"
              style="font-family: 'Space Grotesk', sans-serif;"
              on:click={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? 'VERIFYING...' : 'EXECUTE_AUTH'}
            </button>
          </div>
        </div>

      <!-- ── PROJECTS tab ────────────────────────────────────────────────── -->
      {:else if activeTab === 'projects'}

        <!-- Header -->
        <div class="mb-8 pb-6 border-b-2 border-[#484848] flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="admin-page-title">SYSTEM_DASHBOARD</h1>
            <p class="text-[#ababab] text-sm mt-1">
              Gestion des projets et sequences actives.
            </p>
          </div>
          <div class="text-right font-mono text-xs text-[#ababab]">
            <div>PROJETS: <span class="text-[#9cff93]">{projects.length}</span></div>
            <div>MSGS: <span class="text-[#9cff93]">{messages.length}</span></div>
          </div>
        </div>

        <!-- Stat grid -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div class="admin-stat-card">
            <div class="flex justify-between items-start mb-3">
              <span class="material-symbols-outlined text-[#ff8f73] text-2xl">folder_special</span>
              <span class="font-mono text-xs text-[#484848]">01</span>
            </div>
            <div class="text-3xl font-black text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">{projects.length}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-[#ababab]" style="font-family: 'Space Grotesk', sans-serif;">PROJETS</div>
          </div>

          <div class="admin-stat-card">
            <div class="flex justify-between items-start mb-3">
              <span class="material-symbols-outlined text-[#9cff93] text-2xl">mail</span>
              <span class="font-mono text-xs text-[#484848]">02</span>
            </div>
            <div class="text-3xl font-black text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">{messages.length}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-[#ababab]" style="font-family: 'Space Grotesk', sans-serif;">MESSAGES</div>
          </div>

          <div class="admin-stat-card">
            <div class="flex justify-between items-start mb-3">
              <span class="material-symbols-outlined text-[#e2e2e2] text-2xl">public</span>
              <span class="font-mono text-xs text-[#484848]">03</span>
            </div>
            <div class="text-3xl font-black text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">{projects.filter((p) => p.links?.live).length}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-[#ababab]" style="font-family: 'Space Grotesk', sans-serif;">LIVE_DEPLOY</div>
          </div>

          <div class="admin-stat-card" style="border-color: #ff8f73;">
            <div class="flex justify-between items-start mb-3">
              <span class="material-symbols-outlined text-[#ff8f73] text-2xl">priority_high</span>
              <span class="font-mono text-xs text-[#484848]">04</span>
            </div>
            <div class="text-3xl font-black text-[#ff8f73] mb-1" style="font-family: 'Space Grotesk', sans-serif;">{messages.length}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-[#ababab]" style="font-family: 'Space Grotesk', sans-serif;">PENDING_MSGS</div>
          </div>
        </div>

        <!-- Two-col: list + form/console -->
        <div class="grid grid-cols-12 gap-6">

          <!-- Projects list -->
          <section class="col-span-12 lg:col-span-7" aria-label="Liste des projets">
            <div class="flex items-center justify-between mb-4">
              <h2 class="admin-section-title">
                <span class="inline-block w-6 h-0.5 bg-[#ff8f73] mr-2 align-middle"></span>
                ACTIVE_REPOSITORIES
              </h2>
              <span class="font-mono text-xs text-[#ababab]">TOTAL: {projects.length}</span>
            </div>

            {#if projects.length === 0}
              <div class="admin-empty-state">
                <p>NO_REPOSITORIES_FOUND</p>
              </div>
            {:else}
              <div class="space-y-3 overflow-y-auto cyber-scrollbar" style="max-height: 60vh;">
                {#each projects as project (project.id)}
                  <div
                    class={`flex bg-[#131313] border-2 hover:bg-[#1a1a1a] transition-none group ${editingProjectId === project.id ? 'border-[#ff8f73]' : 'border-[#484848]'}`}
                  >
                    <div
                      class="w-2 flex-shrink-0 transition-none"
                      style={editingProjectId === project.id
                        ? 'background:#ff8f73;min-width:8px;'
                        : 'background:#484848;min-width:8px;'}
                    ></div>
                    <div class="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                      <div class="min-w-0">
                        <h3
                          class="font-black uppercase text-white text-sm truncate"
                          style="font-family: 'Space Grotesk', sans-serif;"
                        >
                          {project.name.toUpperCase()}
                        </h3>
                        <p class="font-mono text-[10px] text-[#ababab] mt-0.5">
                          {project.type} · {project.date}
                        </p>
                      </div>
                      <div class="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          class="border-2 border-[#e2e2e2] text-[#e2e2e2] px-3 py-1.5 text-[10px] font-black uppercase hover:bg-[#e2e2e2] hover:text-[#0e0e0e] transition-none"
                          style="font-family: 'Space Grotesk', sans-serif;"
                          on:click={() => handleEditProject(project)}
                        >
                          {editingProjectId === project.id ? 'EDITING' : 'EDIT'}
                        </button>
                        <button
                          type="button"
                          class="border-2 border-[#ff6e84] text-[#ff6e84] px-3 py-1.5 text-[10px] font-black uppercase hover:bg-[#ff6e84] hover:text-[#0e0e0e] transition-none"
                          style="font-family: 'Space Grotesk', sans-serif;"
                          on:click={() => handleDeleteProject(project.id, project.name)}
                          aria-label="Supprimer {project.name}"
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </section>

          <!-- Side panel: form + console -->
          <div class="col-span-12 lg:col-span-5 space-y-5">

            <!-- Form -->
            <section class="admin-card relative" aria-label="Formulaire projet">
              <div class="admin-card-label" style="background:#ff8f73;color:#0e0e0e;">
                CMD: {editingProjectId ? 'UPDATE_SEQUENCE' : 'INITIALIZE_NEW'}
              </div>
              <h2
                class="font-black uppercase text-white text-sm mb-4 mt-1"
                style="font-family: 'Space Grotesk', sans-serif;"
              >
                {editingProjectId ? 'MODIFIER PROJET' : 'NOUVEAU PROJET'}
              </h2>

              <form class="space-y-3" on:submit|preventDefault={handleSubmitProject}>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="cyber-label" for="cb-name">NAME *</label>
                    <input id="cb-name" type="text" bind:value={projectForm.name} placeholder="PROJET_ID" class="cyber-input w-full" />
                  </div>
                  <div>
                    <label class="cyber-label" for="cb-date">DATE *</label>
                    <input id="cb-date" type="text" bind:value={projectForm.date} placeholder="03/2026" class="cyber-input w-full" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="cyber-label" for="cb-type">TYPE *</label>
                    <input id="cb-type" type="text" bind:value={projectForm.type} placeholder="Svelte + Node" class="cyber-input w-full" />
                  </div>
                  <div>
                    <label class="cyber-label" for="cb-source">SOURCE *</label>
                    <input id="cb-source" type="url" bind:value={projectForm.sourceUrl} placeholder="https://github.com/..." class="cyber-input w-full" />
                  </div>
                </div>

                <div>
                  <label class="cyber-label" for="cb-summary">SUMMARY *</label>
                  <textarea
                    id="cb-summary"
                    bind:value={projectForm.summary}
                    placeholder="Description du projet..."
                    class="cyber-input w-full resize-none"
                    rows="2"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="cyber-label" for="cb-image">IMAGE PATH</label>
                    <input id="cb-image" type="text" bind:value={projectForm.imageUrl} placeholder="/images/projects/..." class="cyber-input w-full" />
                  </div>
                  <div>
                    <label class="cyber-label" for="cb-live">LIVE URL</label>
                    <input id="cb-live" type="url" bind:value={projectForm.liveUrl} placeholder="https://..." class="cyber-input w-full" />
                  </div>
                </div>

                <!-- Demo config (collapsible) -->
                <details class="border border-[#262626]">
                  <summary class="cyber-label px-3 py-2 cursor-pointer hover:bg-[#1f1f1f] transition-none">
                    DEMO_CONFIG <span class="opacity-50">(optionnel)</span>
                  </summary>
                  <div class="grid grid-cols-2 gap-3 p-3">
                    <div>
                      <label class="cyber-label" for="cb-demo-mode">MODE</label>
                      <input id="cb-demo-mode" type="text" bind:value={projectForm.demoMode} placeholder="live / internal" class="cyber-input w-full" />
                    </div>
                    <div>
                      <label class="cyber-label" for="cb-demo-game">GAME</label>
                      <input id="cb-demo-game" type="text" bind:value={projectForm.demoGame} placeholder="mini-reflex" class="cyber-input w-full" />
                    </div>
                    <div>
                      <label class="cyber-label" for="cb-demo-path">PATH</label>
                      <input id="cb-demo-path" type="text" bind:value={projectForm.demoPath} placeholder="/game" class="cyber-input w-full" />
                    </div>
                    <div>
                      <label class="cyber-label" for="cb-demo-url">URL</label>
                      <input id="cb-demo-url" type="url" bind:value={projectForm.demoUrl} placeholder="https://..." class="cyber-input w-full" />
                    </div>
                  </div>
                </details>

                <div class="flex gap-2 pt-1">
                  <button
                    type="submit"
                    class="flex-1 bg-[#ff8f73] text-[#0e0e0e] font-black py-2.5 uppercase tracking-widest text-xs hover:brightness-110 active:translate-x-[1px] active:translate-y-[1px] transition-none disabled:opacity-50"
                    style="font-family: 'Space Grotesk', sans-serif;"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'EXECUTING...' : editingProjectId ? 'EXECUTE_UPDATE' : 'EXECUTE_INIT'}
                  </button>
                  <button
                    type="button"
                    class="border-2 border-[#484848] text-[#ababab] px-4 text-xs font-black uppercase hover:bg-[#1f1f1f] transition-none"
                    style="font-family: 'Space Grotesk', sans-serif;"
                    on:click={resetForm}
                  >
                    {editingProjectId ? 'CANCEL' : 'CLEAR'}
                  </button>
                </div>
              </form>
            </section>

            <!-- System console -->
            <div class="bg-black border-2 border-[#484848] flex flex-col" style="height:220px;">
              <div class="flex items-center gap-2 px-4 py-2.5 border-b border-[#262626]">
                <span class="w-2.5 h-2.5 rounded-none bg-[#ff6e84]"></span>
                <span class="w-2.5 h-2.5 rounded-none bg-[#ff8f73]"></span>
                <span class="w-2.5 h-2.5 rounded-none bg-[#9cff93]"></span>
                <span
                  class="ml-auto font-black uppercase text-[10px] text-[#ababab] tracking-widest"
                  style="font-family: 'Space Grotesk', sans-serif;"
                >SYSTEM_CONSOLE</span>
                <button
                  type="button"
                  class="ml-2 p-1 hover:bg-[#1f1f1f] transition-none text-[#ababab]"
                  on:click={loadAdminData}
                  disabled={isLoading}
                  title="Rafraichir"
                  aria-label="Rafraichir"
                >
                  <span class="material-symbols-outlined text-sm">{isLoading ? 'sync' : 'refresh'}</span>
                </button>
              </div>
              <div class="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 cyber-scrollbar">
                {#each consoleLogs as log}
                  <div class="flex gap-2">
                    <span class={`font-bold flex-shrink-0 log-ts log-${log.type}`}>[{log.ts}]</span>
                    <span class={`log-text log-${log.type}`}>&gt; {log.text}</span>
                  </div>
                {/each}
                <div class="pt-1">
                  <span class="text-[#e2e2e2] border-r-4 border-[#ff8f73] pr-0.5 animate-pulse">_</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      <!-- ── MESSAGES tab ────────────────────────────────────────────────── -->
      {:else if activeTab === 'messages'}

        <div class="mb-8 pb-6 border-b-2 border-[#484848] flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="admin-page-title">INBOUND_SIGNALS</h1>
            <p class="text-[#ababab] text-sm mt-1">{messages.length} transmission(s) recue(s)</p>
          </div>
          <button
            type="button"
            class="border-2 border-[#484848] text-[#ababab] px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#1f1f1f] transition-none disabled:opacity-40"
            style="font-family: 'Space Grotesk', sans-serif;"
            on:click={loadAdminData}
            disabled={isLoading}
          >
            {isLoading ? 'SYNCING...' : 'REFRESH'}
          </button>
        </div>

        {#if messages.length === 0}
          <div class="admin-empty-state">
            <p>NO_SIGNAL_DETECTED</p>
          </div>
        {:else}
          <div class="space-y-4 overflow-y-auto cyber-scrollbar" style="max-height:70vh;">
            {#each messages as message}
              <div class="flex bg-[#131313] border-2 border-[#484848] hover:border-[#9cff93] transition-none">
                <div class="w-2 flex-shrink-0 bg-[#9cff93]" style="min-width:8px;"></div>
                <article class="flex-1 p-5" aria-label="Message de {message.name}">
                  <header class="flex flex-wrap items-start gap-3 mb-3">
                    <div>
                      <div
                        class="font-black uppercase text-white text-sm"
                        style="font-family: 'Space Grotesk', sans-serif;"
                      >{message.name}</div>
                      <a
                        href="mailto:{message.email}"
                        class="font-mono text-[10px] text-[#9cff93] hover:underline"
                      >{message.email}</a>
                    </div>
                    {#if message.createdAt}
                      <time class="ml-auto font-mono text-[10px] text-[#484848]">{message.createdAt}</time>
                    {/if}
                  </header>
                  <p class="font-mono text-xs text-[#e2e2e2] opacity-80 whitespace-pre-wrap border-l-2 border-[#262626] pl-3">
                    {message.message}
                  </p>
                </article>
              </div>
            {/each}
          </div>
        {/if}

      {/if}

    </div>
  </main>
</div>

<style>
  /* ── Shell ────────────────────────────────────────────────────────────── */
  .cyber-admin {
    min-height: 100vh;
    background: #0e0e0e;
    color: #e2e2e2;
  }

  .scanline-crt {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.15) 2px,
      rgba(0, 0, 0, 0.15) 4px
    );
    opacity: 0.4;
  }

  .admin-main {
    padding-left: 16rem; /* 64 = w-64 */
    padding-top: 4rem;   /* 16 = h-16 */
    min-height: 100vh;
    position: relative;
    z-index: 20;
  }

  /* ── Nav ─────────────────────────────────────────────────────────────── */
  .admin-nav-tab {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #e2e2e2;
    padding-bottom: 2px;
    background: transparent;
    border: none;
    cursor: pointer;
    appearance: none;
    transition: none;
  }

  .admin-icon-btn,
  .admin-utility-btn {
    background: transparent;
    border: none;
    appearance: none;
  }

  .admin-utility-btn {
    text-align: left;
  }

  .admin-nav-tab.is-active {
    color: #ff8f73;
    border-bottom: 2px solid #ff8f73;
  }

  .admin-nav-tab:not(.is-active):hover {
    color: #9cff93;
  }

  .admin-side-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    margin-bottom: 2px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #e2e2e2;
    transition: none;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .admin-side-item:not(.is-active):hover {
    background: #1f1f1f;
  }

  .admin-side-item.is-active {
    background: #ff8f73;
    color: #0e0e0e;
    font-weight: 900;
  }

  /* ── Cards & sections ────────────────────────────────────────────────── */
  .admin-page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.04em;
    color: #ff8f73;
    line-height: 1;
  }

  .admin-section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .admin-card {
    background: #131313;
    border: 2px solid #484848;
    padding: 1.25rem;
    box-shadow: 4px 4px 0px 0px #1a1a1a;
  }

  .admin-card-label {
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    background: #484848;
    color: #e2e2e2;
    padding: 0.15rem 0.6rem;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 900;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .admin-stat-card {
    background: #131313;
    border: 2px solid #484848;
    padding: 1.25rem;
    box-shadow: 4px 4px 0px 0px #1a1a1a;
    transition: none;
  }

  .admin-stat-card:hover {
    border-color: #ff8f73;
  }

  .admin-empty-state {
    background: #131313;
    border: 2px solid #484848;
    padding: 3rem;
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #484848;
  }

  /* ── Inputs ──────────────────────────────────────────────────────────── */
  :global(.cyber-admin .cyber-input) {
    background: #0a0a0a;
    border: none;
    border-bottom: 2px solid #484848;
    color: #e2e2e2;
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    padding: 0.4rem 0.5rem;
    outline: none;
    transition: none;
    display: block;
    width: 100%;
  }

  :global(.cyber-admin .cyber-input::placeholder) {
    color: #333;
    text-transform: uppercase;
  }

  :global(.cyber-admin .cyber-input:focus) {
    border-bottom-color: #ff8f73;
  }

  .cyber-label {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #ababab;
    margin-bottom: 0.3rem;
  }

  details > summary {
    list-style: none;
  }

  details > summary::-webkit-details-marker {
    display: none;
  }

  /* ── Console logs ────────────────────────────────────────────────────── */
  :global(.log-info) {
    color: #ababab;
  }

  :global(.log-ok) {
    color: #9cff93;
  }

  :global(.log-warn) {
    color: #ff8f73;
  }

  :global(.log-error) {
    color: #ff6e84;
  }

  /* ── Scrollbar ───────────────────────────────────────────────────────── */
  .cyber-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #ff8f73 #0e0e0e;
  }

  .cyber-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .cyber-scrollbar::-webkit-scrollbar-track {
    background: #0e0e0e;
  }

  .cyber-scrollbar::-webkit-scrollbar-thumb {
    background: #ff8f73;
  }
</style>
