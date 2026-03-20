<script>
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
  let errorMessage = ''

  let projects = []
  let messages = []

  let editingProjectId = null
  let projectForm = { ...emptyForm }

  if (typeof window !== 'undefined') {
    adminKey = window.localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  }

  function resetForm() {
    editingProjectId = null
    projectForm = { ...emptyForm }
  }

  function persistAdminKey() {
    if (typeof window === 'undefined') {
      return
    }

    if (adminKey) {
      window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
      return
    }

    window.localStorage.removeItem(ADMIN_KEY_STORAGE)
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
    errorMessage = ''

    try {
      const [nextProjects, nextMessages] = await Promise.all([
        adminFetchProjects(adminKey),
        adminFetchContactMessages(adminKey),
      ])

      projects = nextProjects
      messages = nextMessages
      isConnected = true
      feedback = 'Connexion admin active. Donnees chargees.'
    } catch (error) {
      isConnected = false
      errorMessage = error?.message || 'Impossible de charger les donnees admin.'
    } finally {
      isLoading = false
    }
  }

  async function handleConnect() {
    feedback = ''

    if (!adminKey.trim()) {
      errorMessage = 'La cle API admin est requise.'
      return
    }

    persistAdminKey()
    await loadAdminData()
  }

  function handleEditProject(project) {
    editingProjectId = project.id
    projectForm = {
      date: project.date || '',
      name: project.name || '',
      type: project.type || '',
      summary: project.summary || '',
      liveUrl: project.links?.live || '',
      sourceUrl: project.links?.source || '',
      demoMode: project.demo?.mode || '',
      demoGame: project.demo?.game || '',
      demoPath: project.demo?.path || '',
      demoUrl: project.demo?.url || '',
    }
  }

  async function handleSubmitProject() {
    isSubmitting = true
    errorMessage = ''
    feedback = ''

    try {
      const payload = normalizeProjectPayload(projectForm)

      if (editingProjectId) {
        await adminUpdateProject(adminKey, editingProjectId, payload)
        feedback = 'Projet mis a jour.'
      } else {
        await adminCreateProject(adminKey, payload)
        feedback = 'Projet cree.'
      }

      resetForm()
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      errorMessage = error?.message || 'Echec de sauvegarde du projet.'
    } finally {
      isSubmitting = false
    }
  }

  async function handleDeleteProject(projectId) {
    if (!confirm('Supprimer ce projet ?')) {
      return
    }

    errorMessage = ''
    feedback = ''

    try {
      await adminDeleteProject(adminKey, projectId)
      if (editingProjectId === projectId) {
        resetForm()
      }

      feedback = 'Projet supprime.'
      await loadAdminData()
      await onProjectsUpdated()
    } catch (error) {
      errorMessage = error?.message || 'Echec de suppression.'
    }
  }
</script>

<section class="panel admin-page" aria-labelledby="admin-title">
  <header class="admin-page__header">
    <div>
      <p class="admin-page__eyebrow">Mode administration</p>
      <h1 id="admin-title">CRUD Projets + messages de contact</h1>
      <p>
        Cette interface consomme les routes protegees API avec la cle
        <code>x-admin-key</code>.
      </p>
    </div>
    <button type="button" class="admin-page__home" on:click={onOpenHomePage}>Retour accueil</button>
  </header>

  <div class="admin-auth">
    <label for="admin-key">Cle API admin</label>
    <input
      id="admin-key"
      type="password"
      bind:value={adminKey}
      placeholder="change-me-in-production"
      autocomplete="off"
    />
    <button type="button" on:click={handleConnect} disabled={isLoading}>
      {isLoading ? 'Connexion...' : 'Charger les donnees'}
    </button>
  </div>

  {#if errorMessage}
    <p class="admin-feedback admin-feedback--error" role="alert">{errorMessage}</p>
  {/if}

  {#if feedback}
    <p class="admin-feedback" role="status">{feedback}</p>
  {/if}

  {#if isConnected}
    <div class="admin-grid">
      <section class="admin-card">
        <h2>Projets existants</h2>
        {#if projects.length === 0}
          <p>Aucun projet en base.</p>
        {:else}
          <ul class="admin-projects-list">
            {#each projects as project}
              <li>
                <div>
                  <strong>{project.name}</strong>
                  <p>{project.type} · {project.date}</p>
                </div>
                <div class="admin-row-actions">
                  <button type="button" on:click={() => handleEditProject(project)}>Editer</button>
                  <button type="button" class="danger" on:click={() => handleDeleteProject(project.id)}>
                    Supprimer
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="admin-card">
        <h2>{editingProjectId ? 'Modifier le projet' : 'Creer un projet'}</h2>
        <div class="admin-form">
          <label>
            Date
            <input type="text" bind:value={projectForm.date} placeholder="03/2026" />
          </label>
          <label>
            Nom
            <input type="text" bind:value={projectForm.name} placeholder="Nom du projet" />
          </label>
          <label>
            Type
            <input type="text" bind:value={projectForm.type} placeholder="Svelte + Laravel" />
          </label>
          <label class="full">
            Resume
            <textarea rows="4" bind:value={projectForm.summary}></textarea>
          </label>
          <label>
            URL live
            <input type="url" bind:value={projectForm.liveUrl} placeholder="https://..." />
          </label>
          <label>
            URL source
            <input type="url" bind:value={projectForm.sourceUrl} placeholder="https://github.com/..." />
          </label>
          <label>
            Demo mode
            <input type="text" bind:value={projectForm.demoMode} placeholder="live | internal | sandbox" />
          </label>
          <label>
            Demo game
            <input type="text" bind:value={projectForm.demoGame} placeholder="mini-reflex" />
          </label>
          <label>
            Demo path
            <input type="text" bind:value={projectForm.demoPath} placeholder="/game" />
          </label>
          <label>
            Demo URL
            <input type="url" bind:value={projectForm.demoUrl} placeholder="https://..." />
          </label>
        </div>

        <div class="admin-row-actions admin-row-actions--bottom">
          <button type="button" on:click={handleSubmitProject} disabled={isSubmitting}>
            {isSubmitting ? 'Sauvegarde...' : editingProjectId ? 'Mettre a jour' : 'Creer'}
          </button>
          <button type="button" class="ghost" on:click={resetForm}>Reinitialiser</button>
        </div>
      </section>
    </div>

    <section class="admin-card admin-card--contacts">
      <h2>Messages de contact recents</h2>
      {#if messages.length === 0}
        <p>Aucun message pour le moment.</p>
      {:else}
        <div class="admin-messages">
          {#each messages as message}
            <article>
              <header>
                <strong>{message.name}</strong>
                <span>{message.email}</span>
                <time>{message.createdAt}</time>
              </header>
              <p>{message.message}</p>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</section>
