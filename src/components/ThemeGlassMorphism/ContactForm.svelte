<script>
  export let onSubmitDone = () => {}

  let name = ''
  let email = ''
  let message = ''
  let sending = false
  let sent = false
  let error = ''

  async function submitForm(event) {
    event.preventDefault()
    if (sending) return

    if (!name.trim() || !email.trim() || !message.trim()) {
      error = 'Tous les champs sont requis.'
      return
    }

    error = ''
    sending = true

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })

      if (!response.ok) {
        throw new Error('Echec de l envoi.')
      }

      sent = true
      name = ''
      email = ''
      message = ''
      onSubmitDone()
    } catch (nextError) {
      error = nextError?.message || 'Echec de l envoi.'
    } finally {
      sending = false
    }
  }
</script>

<section id="contact" class="gm-contact scroll-mt-20" aria-label="Contact">
  <div class="gm-contact__head">
    <h2>Transformons une idee ambitieuse en produit concret.</h2>
    <p>Besoin d'un developpeur polyvalent pour votre prochain projet Svelte ou Laravel ? Parlons-en.</p>
  </div>

  <div class="glass-panel gm-contact__panel">
    {#if sent}
      <p class="gm-contact__feedback" role="status">Message bien recu. Je vous recontacte rapidement.</p>
    {/if}

    {#if error}
      <p class="gm-contact__feedback gm-contact__feedback--error" role="alert">{error}</p>
    {/if}

    <form class="gm-contact__form" on:submit={submitForm}>
      <div>
        <label for="gm-name">Nom complet</label>
        <input id="gm-name" type="text" bind:value={name} placeholder="John Doe" />
      </div>
      <div>
        <label for="gm-email">Email</label>
        <input id="gm-email" type="email" bind:value={email} placeholder="john@example.com" />
      </div>
      <div class="full">
        <label for="gm-message">Message</label>
        <textarea id="gm-message" rows="4" bind:value={message} placeholder="Decrivez votre projet..."></textarea>
      </div>
      <div class="full gm-contact__submit-wrap">
        <button class="gm-btn gm-btn--primary" type="submit" disabled={sending}>
          {sending ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </div>
    </form>
  </div>
</section>
