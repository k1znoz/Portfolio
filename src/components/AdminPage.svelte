<script>
  import { onDestroy } from 'svelte'

  import {
    adminCreateProject,
    adminDeleteProject,
    adminFetchContactMessages,
    adminFetchProjects,
    adminUpdateProject,
  } from '../lib/api-client'
  import '../styles/components/admin-page.css'

  export let onOpenHomePage
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
  let feedback = ''
  let feedbackIsError = false
  let feedbackTimer = null
  let activeTab = 'projects'

  let projects = []
  let messages = []

  let editingProjectId = null
  let projectForm = { ...emptyForm }

  if (typeof window !== 'undefined') {
    adminKey = window.localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  }

  onDestroy(() => {
    if (feedbackTimer) clearTimeout(feedbackTimer)
  })

  function showFeedback(message, isError = false) {
    if (feedbackTimer) clearTimeout(feedbackTimer)
    feedback = message
    feedbackIsError = isError
    feedbackTimer = setTimeout(() => {
      feedback = ''
    }, 4000)
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
      throw new Error('Les champs date, nom, type, resume et source sont obligatoires.')
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

    try {
      const [nextProjects, nextMessages] = await Promise.all([
        adminFetchProjects(adminKey),
        adminFetchContactMessages(adminKey),
      ])

      projects = nextProjects
      messages = nextMessages
      isConnected = true
      showFeedback(`${nextProjects.length} projet(s) · ${nextMessages.length} message(s) charges.`)
    } catch (error) {
      isConnected = false
      showFeedback(error?.message || 'Impossible de charger les donnees admin.', true)
    } finally {
      isLoading = false
    }
  }

  async function handleConnect() {
    if (!adminKey.trim()) {
      showFeedback('La cle API admin est requise.', true)
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
        showFeedback('Projet mis a jour avec succes.')
      } else {
        await adminCreateProject(adminKey, payload)
        showFeedback('Nouveau projet cree avec succes.')
      }

      resetForm()
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      showFeedback(error?.message || 'Echec de sauvegarde du projet.', true)
    } finally {
      isSubmitting = false
    }
  }

  async function handleDeleteProject(projectId, projectName) {
    if (!confirm(`Supprimer "${projectName}" ? Cette action est irreversible.`)) {
      return
    }

    try {
      await adminDeleteProject(adminKey, projectId)
      if (editingProjectId === projectId) resetForm()
      showFeedback('Projet supprime.')
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      showFeedback(error?.message || 'Echec de suppression.', true)
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="panel admin-page" aria-labelledby="admin-title">

  <!-- ── En-tête ── -->
  <header class="admin-page__header">
    <div>
      <p class="kicker">Mode administration</p>
      <h1 id="admin-title">Interface admin</h1>
    </div>
    <div class="admin-header-actions">
      {#if isConnected}
        <span class="admin-badge admin-badge--connected" aria-live="polite">
          <span class="admin-badge__dot" aria-hidden="true"></span>
          API connectee
        </span>
        <button type="button" class="admin-btn ghost" on:click={handleDisconnect}>
          Deconnexion
        </button>
      {/if}
      <button type="button" class="admin-btn ghost" on:click={onOpenHomePage}>
        ← Accueil
      </button>
    </div>
  </header>

  <!-- ── Banner feedback auto-dismiss ── -->
  {#if feedback}
    <p
      class="admin-feedback"
      class:admin-feedback--error={feedbackIsError}
      role={feedbackIsError ? 'alert' : 'status'}
    >
      {feedback}
    </p>
  {/if}

  <!-- ── Authentification ── -->
  {#if !isConnected}
    <div class="admin-auth-panel">
      <p class="admin-auth-panel__label">Entrez votre cle <code>x-admin-key</code> pour acceder aux routes protegees.</p>
      <div class="admin-auth-panel__row">
        <input
          id="admin-key"
          type="password"
          bind:value={adminKey}
          placeholder="Cle API admin"
          autocomplete="off"
          on:keydown={(e) => e.key === 'Enter' && handleConnect()}
        />
        <button type="button" class="admin-btn primary" on:click={handleConnect} disabled={isLoading}>
          {isLoading ? 'Verification...' : 'Connexion'}
        </button>
      </div>
    </div>

  {:else}

    <!-- ── Onglets ── -->
    <nav class="admin-tabs" aria-label="Sections admin">
      <button
        type="button"
        class="admin-tab"
        class:is-active={activeTab === 'projects'}
        on:click={() => (activeTab = 'projects')}
      >
        Projets
        <span class="admin-tab__count">{projects.length}</span>
      </button>
      <button
        type="button"
        class="admin-tab"
        class:is-active={activeTab === 'messages'}
        on:click={() => (activeTab = 'messages')}
      >
        Messages
        <span class="admin-tab__count">{messages.length}</span>
      </button>
      <button
        type="button"
        class="admin-tab admin-tab--refresh"
        on:click={loadAdminData}
        disabled={isLoading}
        aria-label="Rafraichir les donnees"
      >
        {isLoading ? '...' : '↺'}
      </button>
    </nav>

    <!-- ── Onglet Projets ── -->
    {#if activeTab === 'projects'}
      <div class="admin-grid">

        <!-- Liste -->
        <section class="admin-card" aria-label="Liste des projets">
          {#if projects.length === 0}
            <p class="admin-empty">Aucun projet en base.</p>
          {:else}
            <ul class="admin-projects-list">
              {#each projects as project}
                <li class:is-editing={editingProjectId === project.id}>
                  <div class="admin-project-info">
                    <strong>{project.name}</strong>
                    <span class="admin-project-meta">{project.type} · {project.date}</span>
                  </div>
                  <div class="admin-row-actions">
                    <button
                      type="button"
                      class="admin-btn secondary"
                      on:click={() => handleEditProject(project)}
                    >
                      {editingProjectId === project.id ? '✎ En cours' : 'Editer'}
                    </button>
                    <button
                      type="button"
                      class="admin-btn danger"
                      on:click={() => handleDeleteProject(project.id, project.name)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <!-- Formulaire création / édition -->
        <section class="admin-card" aria-label={editingProjectId ? 'Modifier le projet' : 'Creer un projet'}>
          <div class="admin-card__heading">
            <h2>{editingProjectId ? 'Modifier' : 'Nouveau projet'}</h2>
            {#if editingProjectId}
              <span class="admin-edit-hint">Echap pour annuler</span>
            {/if}
          </div>

          <div class="admin-form">
            <label>
              <span>Date <abbr title="obligatoire">*</abbr></span>
              <input type="text" bind:value={projectForm.date} placeholder="03/2026" />
            </label>
            <label>
              <span>Nom <abbr title="obligatoire">*</abbr></span>
              <input type="text" bind:value={projectForm.name} placeholder="Nom du projet" />
            </label>
            <label>
              <span>Type <abbr title="obligatoire">*</abbr></span>
              <input type="text" bind:value={projectForm.type} placeholder="Svelte + Laravel" />
            </label>
            <label class="full">
              <span>Resume <abbr title="obligatoire">*</abbr></span>
              <textarea rows="3" bind:value={projectForm.summary}></textarea>
            </label>
            <label>
              <span>URL source <abbr title="obligatoire">*</abbr></span>
              <input type="url" bind:value={projectForm.sourceUrl} placeholder="https://github.com/..." />
            </label>
            <label>
              <span>URL live</span>
              <input type="url" bind:value={projectForm.liveUrl} placeholder="https://..." />
            </label>
            <label class="full">
              <span>Image (path public)</span>
              <input type="text" bind:value={projectForm.imageUrl} placeholder="/images/projects/MonProjet.png" />
            </label>
            <label>
              <span>Demo mode</span>
              <input type="text" bind:value={projectForm.demoMode} placeholder="live | internal" />
            </label>
            <label>
              <span>Demo path</span>
              <input type="text" bind:value={projectForm.demoPath} placeholder="/game" />
            </label>
            <label>
              <span>Demo URL</span>
              <input type="url" bind:value={projectForm.demoUrl} placeholder="https://..." />
            </label>
            <label>
              <span>Demo game</span>
              <input type="text" bind:value={projectForm.demoGame} placeholder="mini-reflex" />
            </label>
          </div>

          <div class="admin-form-actions">
            <button
              type="button"
              class="admin-btn primary"
              on:click={handleSubmitProject}
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                Sauvegarde...
              {:else if editingProjectId}
                Mettre a jour
              {:else}
                Creer le projet
              {/if}
            </button>
            {#if editingProjectId}
              <button type="button" class="admin-btn ghost" on:click={resetForm}>
                Annuler
              </button>
            {:else}
              <button type="button" class="admin-btn ghost" on:click={resetForm}>
                Vider
              </button>
            {/if}
          </div>
        </section>

      </div>
    {/if}

    <!-- ── Onglet Messages ── -->
    {#if activeTab === 'messages'}
      <section class="admin-card admin-card--full" aria-label="Messages de contact">
        {#if messages.length === 0}
          <p class="admin-empty">Aucun message pour le moment.</p>
        {:else}
          <div class="admin-messages">
            {#each messages as message}
              <article class="admin-message">
                <header class="admin-message__header">
                  <strong class="admin-message__name">{message.name}</strong>
                  <a class="admin-message__email" href="mailto:{message.email}">{message.email}</a>
                  <time class="admin-message__date">{message.createdAt}</time>
                </header>
                <p class="admin-message__body">{message.message}</p>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/if}

  {/if}

</section>
