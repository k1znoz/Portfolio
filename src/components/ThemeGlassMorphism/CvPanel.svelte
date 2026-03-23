<script>
  export let cvFileUrl = '/files/CV-DEV-25.pdf'
  export let onOpenCvPage = () => {}
</script>

<section id="cv" class="gm-cv scroll-mt-20" aria-label="CV">
  <div class="glass-panel gm-cv__panel">
    <div class="gm-cv__text">
      <h2>Un CV consultable<br />sans casser la perf.</h2>
      <p>
        Parcourez mon historique technique directement en ligne ou telechargez une version
        optimisee pour l'impression.
      </p>
    </div>

    <div class="gm-cv__actions">
      <button type="button" class="gm-btn gm-btn--primary" on:click={onOpenCvPage}>
        Ouvrir la page CV
      </button>
      <a class="gm-btn gm-btn--ghost" href={cvFileUrl} download>
        <span class="material-symbols-outlined" aria-hidden="true">download</span>
        Telecharger le PDF
      </a>
    </div>
  </div>
</section>
