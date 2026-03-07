<script>
  import '../styles/components/contact-section.css'

  export let contactLinks

  let isSent = false

  function handleSubmit() {
    isSent = true
  }
</script>

<section id="contact" class="panel contact-section">
  <div class="contact-section__intro">
    <p class="kicker">Me contacter</p>
    <h2>Transformons une idee ambitieuse en produit concret.</h2>
    <p>Discutons de ton besoin, de la deadline et du niveau de finition attendu.</p>
  </div>

  <form class="contact-form" on:submit|preventDefault={handleSubmit}>
    <label>
      Nom
      <input type="text" name="name" placeholder="Ton nom" required />
    </label>

    <label>
      Email
      <input type="email" name="email" placeholder="ton@email.com" required />
    </label>

    <label>
      Message
      <textarea name="message" rows="4" placeholder="Parle-moi de ton projet" required></textarea>
    </label>

    <button type="submit">Envoyer</button>

    {#if isSent}
      <p class="contact-feedback" role="status" aria-live="polite">
        Message bien recu. Je te recontacte rapidement.
      </p>
    {/if}
  </form>

  <div class="contact-links">
    {#each contactLinks as link}
      <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
    {/each}
  </div>
</section>
