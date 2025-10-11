<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserEngines } from '../lib/engines.js';
  import { getUserSessions } from '../lib/sessions.js';
  import { getUserTracks } from '../lib/tracks.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import LayoutGrid, { Cell } from '@smui/layout-grid';

  let tyres = [];
  let engines = [];
  let sessions = [];
  let tracks = [];
  let loading = true;
  let error = '';

  const loadData = async () => {
    try {
      loading = true;
      const [tyresData, enginesData, sessionsData, tracksData] = await Promise.all([
        getUserTyres(),
        getUserEngines(),
        getUserSessions(),
        getUserTracks()
      ]);
      tyres = tyresData;
      engines = enginesData;
      sessions = sessionsData;
      tracks = tracksData;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(loadData);
</script>

<div class="container container-lg">
  <div class="page-header">
    <h1>🏎️ Kart Manager Dashboard</h1>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading dashboard...</p>
    </div>
  {:else}
    <LayoutGrid>
      <Cell span={3}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🏁</div>
            <h3>Sessions</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{sessions.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/sessions" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🛞</div>
            <h3>Tyres</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{tyres.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/tyres" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">⚙️</div>
            <h3>Engines</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{engines.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/engines" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🏁</div>
            <h3>Tracks</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{tracks.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/tracks" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>
    </LayoutGrid>
  {/if}
</div>

<style>
  .stat-icon {
    font-size: 3rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 1.5rem;
  }
</style>
