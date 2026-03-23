<script>
  export let ownerName   = 'Alois Sautet'
  export let currentYear = new Date().getFullYear()

  // Contact links passed from portfolio.js
  export let contactLinks = []

  // Derived shortcut links
  $: emailLink  = contactLinks.find((l) => l.label === 'Email')?.href ?? 'mailto:alois.sautet@gmail.com'
  $: githubLink = contactLinks.find((l) => l.label === 'GitHub')?.href ?? 'https://github.com/k1znoz'
  $: linkedInLink = contactLinks.find((l) => l.label?.toLowerCase().includes('linkedin'))?.href ?? '#'
</script>

<!-- FOOTER ---------------------------------------------------------------- -->
<footer class="iron-footer" aria-label="Pied de page">
  <!-- Copyright -->
  <p class="iron-footer__copy">
    © {currentYear} THE IRON FOUNDRY — {ownerName.toUpperCase()} | MANUFACTURED IN CODE
  </p>

  <!-- Social links -->
  <nav class="iron-footer__links" aria-label="Liens de contact">
    <a href={emailLink} class="iron-footer__link">ENCRYPTED_COMMS</a>
    <a href={githubLink} target="_blank" rel="noreferrer noopener" class="iron-footer__link">
      GITHUB_FORGE
    </a>
    {#if linkedInLink !== '#'}
      <a href={linkedInLink} target="_blank" rel="noreferrer noopener" class="iron-footer__link">
        LINKEDIN_STEEL
      </a>
    {/if}
  </nav>

  <!-- Version tag -->
  <p class="iron-footer__version">V1.0_STABLE // BUILT_WITH_SVELTE_&amp;_METAL</p>
</footer>
