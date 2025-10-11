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

    {#if sessions.length > 0}
      <div class="recent-section">
        <h2>Recent Sessions</h2>
        <div class="recent-sessions">
          {#each sessions.slice(0, 3) as session}
            <Card class="card-hover">
              <div class="card-header card-header-active">
                <h3>Session</h3>
              </div>
              <div class="card-details">
                <div class="detail">
                  <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                </div>
                <div class="detail">
                  <strong>Session:</strong> {session.session}
                </div>
                <div class="detail">
                  <strong>Laps:</strong> {session.laps}
                </div>
                {#if session.fastest}
                  <div class="detail">
                    <strong>Best Lap:</strong> {session.fastest}s
                  </div>
                {/if}
              </div>
              <div class="card-actions">
                <Button href="/sessions/{session.id}" tag="a" use={[link]} variant="raised" style="background-color: #28a745;">View</Button>
              </div>
            </Card>
          {/each}
        </div>
        <div class="view-all-sessions">
          <a href="/sessions" use:link>View All Sessions →</a>
        </div>
      </div>
    {/if}
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

  .recent-section {
    margin-top: 3rem;
  }

  .recent-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
  }

  .recent-sessions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .view-all-sessions {
    text-align: center;
  }

  .view-all-sessions a {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
  }

  .view-all-sessions a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .recent-sessions {
      grid-template-columns: 1fr;
    }
  }
</style>
