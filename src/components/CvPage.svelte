<script>
  import { onDestroy, tick } from 'svelte'
  import '../styles/components/cv-page.css'

  export let cvProfile
  export let cvWeb
  export let currentTheme

  const skillIcons = {
    HTML: '/images/icons/html.svg',
    CSS: '/images/icons/css.svg',
    SCSS: '/images/icons/scss.svg',
    JavaScript: '/images/icons/javascript.svg',
    TypeScript: '/images/icons/typescript.svg',
    Svelte: '/images/icons/svelte.svg',
    PHP: '/images/icons/php.svg',
    Laravel: '/images/icons/laravel.svg',
    MySQL: '/images/icons/mysql.svg',
    Java: '/images/icons/java.svg',
  }

  let isRevealed = false
  let revealRoot
  let revealObserver

  function clearRevealObserver() {
    if (revealObserver) {
      revealObserver.disconnect()
      revealObserver = null
    }
  }

  function setupRevealObserver() {
    clearRevealObserver()

    const revealBlocks = revealRoot?.querySelectorAll('[data-reveal]')

    if (!revealBlocks || revealBlocks.length === 0) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      revealBlocks.forEach((block) => block.classList.add('is-visible'))
      return
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            revealObserver?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.22,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    revealBlocks.forEach((block) => revealObserver.observe(block))
  }

  async function revealCv() {
    if (isRevealed) {
      return
    }

    isRevealed = true
    await tick()
    setupRevealObserver()
  }

  onDestroy(clearRevealObserver)
</script>

<section
  class="panel cv-page"
  aria-labelledby="cv-page-title"
  on:mouseenter={revealCv}
  on:focusin={revealCv}
  on:touchstart={revealCv}
>
  <div class="cv-page__head">
    <p class="kicker">CV Experience</p>
    <h1 id="cv-page-title">{cvWeb.fullName} · {cvWeb.title}</h1>
    <p class="cv-page__subtitle">{cvWeb.subtitle}</p>
    <p>
      {cvWeb.pitch}
    </p>

    <div class="cv-page__actions">
      <a class="cv-page-btn" href={cvProfile.fileUrl} target="_blank" rel="noreferrer">Ouvrir PDF</a
      >
      <a class="cv-page-btn" href={cvProfile.fileUrl} download>Télécharger</a>
    </div>
  </div>

  {#if isRevealed}
    <div bind:this={revealRoot} class={`cv-reveal cv-reveal--${currentTheme.id} is-open`}>
      <aside class="cv-aside">
        <figure
          class="cv-aside-block cv-aside-block--portrait cv-aside-media cv-aside-media--portrait reveal-block"
          data-reveal
          style="--reveal-order: 0"
        >
          <img src={cvWeb.media.portrait} alt={`Portrait de ${cvWeb.fullName}`} loading="lazy" />
        </figure>

        <div class="cv-aside-block cv-aside-block--details">
          <section class="cv-card-block reveal-block" data-reveal style="--reveal-order: 1">
            <h2>Contact</h2>
            <ul>
              {#each cvWeb.contact as item}
                <li>{item}</li>
              {/each}
            </ul>
          </section>

          <section class="cv-card-block reveal-block" data-reveal style="--reveal-order: 2">
            <h2>Competences</h2>
            <div class="cv-skill-grid">
              {#each cvWeb.skills as skill}
                <span class="cv-skill-chip">
                  {#if skillIcons[skill]}
                    <img class="cv-skill-icon" src={skillIcons[skill]} alt="" loading="lazy" decoding="async" />
                  {/if}
                  <span>{skill}</span>
                </span>
              {/each}
            </div>
          </section>

          <section class="cv-card-block reveal-block" data-reveal style="--reveal-order: 3">
            <h2>Centres d'interet</h2>
            <ul>
              {#each cvWeb.interests as interest}
                <li>{interest}</li>
              {/each}
            </ul>
          </section>
        </div>

        <figure
          class="cv-aside-block cv-aside-block--knife cv-aside-media cv-aside-media--knife reveal-block"
          data-reveal
          style="--reveal-order: 4"
        >
          <img src={cvWeb.media.knife} alt="Photographie d'un couteau artisanal" loading="lazy" />
        </figure>
      </aside>

      <div class="cv-main">
        <section class="cv-card-block reveal-block" data-reveal style="--reveal-order: 0">
          <h2>Experiences</h2>
          <div class="cv-timeline">
            {#each cvWeb.experiences as experience, index}
              <article class="reveal-block reveal-block--nested" data-reveal style={`--reveal-order: ${index + 1}`}>
                <p class="cv-period">{experience.period}</p>
                <h3>{experience.role}</h3>
                <p class="cv-company">{experience.company}</p>
                <ul>
                  {#each experience.points as point}
                    <li>{point}</li>
                  {/each}
                </ul>
              </article>
            {/each}
          </div>
        </section>

        <section class="cv-card-block reveal-block" data-reveal style="--reveal-order: 2">
          <h2>Formations</h2>
          <div class="cv-education">
            {#each cvWeb.education as edu, index}
              <article class="reveal-block reveal-block--nested" data-reveal style={`--reveal-order: ${index + 1}`}>
                <p class="cv-period">{edu.period}</p>
                <p>{edu.title}</p>
              </article>
            {/each}
          </div>
        </section>
      </div>
    </div>
  {:else}
    <div class="cv-placeholder" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  {/if}
</section>
