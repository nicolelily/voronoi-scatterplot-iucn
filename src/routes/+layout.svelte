<script>
  let { children } = $props();
</script>

<svelte:head>
  <link rel="stylesheet" href="./style.css" />
  <link rel="stylesheet" href="./highlight-theme.css" />
</svelte:head>

<main>
  {@render children()}
</main>

