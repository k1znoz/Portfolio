<script>
  import MiniReflexGame from './MiniReflexGame.svelte'
  import '../styles/components/game-page.css'

  export let onOpenHomePage
</script>

<section class="panel game-page" id="game">
  <header class="game-page-head">
    <p class="kicker">Mini jeu</p>
    <h1>Reflex Shot - Mode grand format</h1>
    <p class="game-page-intro">
      Version dediee du mini-jeu pour jouer dans de meilleures conditions.
    </p>
    <div class="game-page-actions">
      <button type="button" class="game-page-back" on:click={onOpenHomePage}>Retour accueil</button>
      <a class="game-page-source" href="#projects">Voir le projet</a>
    </div>
  </header>

  <div class="game-page-stage">
    <MiniReflexGame />
  </div>
</section>
