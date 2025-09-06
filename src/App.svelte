<script>
  import Router from 'svelte-spa-router';
  import { user, loading } from './lib/stores.js';
  import Login from './routes/Login.svelte';
  import Dashboard from './routes/Dashboard.svelte';
  import NewTyre from './routes/NewTyre.svelte';
  import EditTyre from './routes/EditTyre.svelte';
  import Navigation from './lib/Navigation.svelte';

  // Define routes
  const routes = {
    '/': Dashboard,
    '/login': Login,
    '/tyres': Dashboard,
    '/tyres/new': NewTyre,
    '/tyres/:id': EditTyre
  };
</script>

<main>
  {#if $loading}
    <div class="loading">
      <p>Loading...</p>
    </div>
  {:else if $user}
    <Navigation />
    <div class="container">
      <Router {routes} />
    </div>
  {:else}
    <Login />
  {/if}
</main>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  main {
    font-family: Arial, sans-serif;
  }
</style>
