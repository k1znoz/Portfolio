<script>
  import TowerDefenseGame from './TowerDefenseGame.svelte'
  import '../styles/components/game-page.css'

  export let onOpenHomePage
</script>

<section class="panel game-page" id="tower-defense">
  <header class="game-page-head">
    <p class="kicker">Mini jeu</p>
    <h1>Tower Defense - Mode grand format</h1>
    <p class="game-page-intro">
      Survis aux vagues dans une lane unique: place tes tours, gere ton or, et tiens le plus longtemps possible.
    </p>
    <div class="game-page-actions">
      <button type="button" class="game-page-back" on:click={onOpenHomePage}>Retour accueil</button>
      <a class="game-page-source" href="#projects">Voir le projet</a>
    </div>
  </header>

  <div class="game-page-stage">
    <TowerDefenseGame />
  </div>
</section>
