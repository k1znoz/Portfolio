<script>
  import { chargeCta } from '../lib/premium-interactions'
  import {
    submitContactMessage,
    validateContactInput,
  } from '../lib/contact-form'
  import { titleReveal } from '../lib/title-reveal'
  import '../styles/components/contact-section.css'

  export let contactLinks

  let name = ''
  let email = ''
  let message = ''
  let consent = false
  let company = ''
  let isSent = false
  let isSubmitting = false
  let formError = ''

  function resetForm() {
    name = ''
    email = ''
    message = ''
    consent = false
    company = ''
  }

  async function handleSubmit() {
    isSent = false
    formError = ''

    const validation = validateContactInput({
      name,
      email,
      message,
      consent,
      company,
    })

    if (!validation.ok) {
      formError = validation.error
      return
    }

    isSubmitting = true

    try {
      await submitContactMessage({
        name,
        email,
        message,
      })
      isSent = true
      resetForm()
    } catch {
      formError = 'Une erreur est survenue. Merci de reessayer dans quelques instants.'
    } finally {
      isSubmitting = false
    }
  }
</script>

<section id="contact" class="panel contact-section">
  <div class="contact-section__intro">
    <p class="kicker">Me contacter</p>
    <h2 use:titleReveal>Transformons une idee ambitieuse en produit concret.</h2>
    <p>Discutons de ton besoin, de la deadline et du niveau de finition attendu.</p>
  </div>

  <form class="contact-form" on:submit|preventDefault={handleSubmit}>
    <label>
      Nom
      <input type="text" name="name" placeholder="Ton nom" bind:value={name} autocomplete="name" required />
    </label>

    <label>
      Email
      <input type="email" name="email" placeholder="ton@email.com" bind:value={email} autocomplete="email" required />
    </label>

    <label>
      Message
      <textarea
        name="message"
        rows="4"
        placeholder="Parle-moi de ton projet"
        bind:value={message}
        minlength="20"
        required
      ></textarea>
    </label>

    <label class="contact-form__consent">
      <input type="checkbox" name="consent" bind:checked={consent} required />
      <span>
        J'accepte que mes donnees soient utilisees pour me recontacter dans le cadre de ma demande.
      </span>
    </label>

    <label class="contact-form__honeypot" aria-hidden="true">
      Site web
      <input type="text" name="company" bind:value={company} tabindex="-1" autocomplete="off" />
    </label>

    <button type="submit" use:chargeCta disabled={isSubmitting}>
      {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
    </button>

    {#if formError}
      <p class="contact-feedback contact-feedback--error" role="alert">
        {formError}
      </p>
    {/if}

    {#if isSent}
      <p class="contact-feedback" role="status" aria-live="polite">
        Message bien recu. Je vous recontacte rapidement.
      </p>
    {/if}
  </form>

  <div class="contact-links">
    {#each contactLinks as link}
      <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
    {/each}
  </div>
</section>
