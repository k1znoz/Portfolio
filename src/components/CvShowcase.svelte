<script>
  import { chargeCta, tiltCard } from '../lib/premium-interactions'
  import { titleReveal } from '../lib/title-reveal'
  import '../styles/components/cv-showcase.css'

  export let cvProfile
  export let onOpenCvPage
</script>

<section id="cv" class="panel cv-showcase" aria-labelledby="cv-title">
  <div class="cv-showcase__copy">
    <p class="kicker">Profil pro</p>
    <h2 id="cv-title" use:titleReveal>Un CV consultable sans casser la perf.</h2>
    <p>
      Apercu elegant en un clic, telechargement direct, et chargement du PDF uniquement quand on
      ouvre la preview.
    </p>

    <div class="cv-showcase__actions">
      <button type="button" class="cv-btn cv-btn--primary" on:click={onOpenCvPage} use:chargeCta>
        Ouvrir la page CV
      </button>
      <a class="cv-btn cv-btn--ghost" href={cvProfile.fileUrl} download>Télécharger le PDF</a>
    </div>
  </div>

  <button class="cv-card" type="button" on:click={onOpenCvPage} aria-label="Ouvrir la page CV" use:tiltCard={{ intensity: 5, scale: 1.01 }}>
    <span class="cv-card__tag">{cvProfile.fileName}</span>
    <div class="cv-card__sheet" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </button>
</section>
