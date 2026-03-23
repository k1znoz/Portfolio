<script>
  export let ownerName = 'k1znoz'
  export let currentYear = new Date().getFullYear()
  export let contactLinks = []

  $: github = contactLinks.find((link) => link.label.toLowerCase().includes('github'))?.href || '#'
  $: linkedin = contactLinks.find((link) => link.label.toLowerCase().includes('linkedin'))?.href || '#'
  $: email = contactLinks.find((link) => link.label.toLowerCase().includes('email'))?.href || '#'
</script>

<footer class="gm-footer" aria-label="Pied de page">
  <div>
    <strong>{String(ownerName).toUpperCase()}</strong>
    <p>&copy; {currentYear} {String(ownerName).toUpperCase()}. Built with Svelte &amp; Laravel.</p>
  </div>

  <nav aria-label="Liens externes">
    <a href={github} target="_blank" rel="noreferrer">GitHub</a>
    <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
    <a href={email}>Email</a>
  </nav>
</footer>
