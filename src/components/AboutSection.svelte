<script>
  import { panelSpotlight, tiltCard } from '../lib/premium-interactions'
  import { titleReveal } from '../lib/title-reveal'
  import '../styles/components/about-section.css'

  export let services
</script>

<section id="about" class="panel about-section" use:panelSpotlight>
  <div>
    <p class="kicker">A propos</p>
    <h2 use:titleReveal>Parcours hybride: service, rigueur terrain, puis developpement web.</h2>
    <p>
      Diplome DWWM en 2025, j'apporte une base technique frontend/backend et une forte capacite
      d'adaptation issue d'experiences variees en environnement client et operationnel.
    </p>
  </div>

  <div class="about-grid">
    {#each services as service}
      <article class="about-card" use:tiltCard={{ intensity: 4.5, scale: 1.008 }}>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </article>
    {/each}
  </div>
</section>
