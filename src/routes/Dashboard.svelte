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

<div class="dashboard">
  <div class="header">
    <h1>🏎️ Kart Manager Dashboard</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading dashboard...</p>
    </div>
  {:else}
    <LayoutGrid>
      <Cell span={3}>
        <Card style="padding: 2rem; text-align: center;">
          <div class="stat-icon">🏁</div>
          <h3>Sessions</h3>
          <div class="stat-number">{sessions.length}</div>
          <div class="stat-actions">
            <Button href="/sessions" {link} variant="outlined">View All</Button>
            <Button href="/sessions/new" {link} variant="raised" color="primary">Add Session</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card style="padding: 2rem; text-align: center;">
          <div class="stat-icon">🛞</div>
          <h3>Tyres</h3>
          <div class="stat-number">{tyres.length}</div>
          <div class="stat-actions">
            <Button href="/tyres" {link} variant="outlined">View All</Button>
            <Button href="/tyres/new" {link} variant="raised" color="primary">Add Tyre</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card style="padding: 2rem; text-align: center;">
          <div class="stat-icon">⚙️</div>
          <h3>Engines</h3>
          <div class="stat-number">{engines.length}</div>
          <div class="stat-actions">
            <Button href="/engines" {link} variant="outlined">View All</Button>
            <Button href="/engines/new" {link} variant="raised" color="primary">Add Engine</Button>
          </div>
        </Card>
      </Cell>

      <Cell span={3}>
        <Card style="padding: 2rem; text-align: center;">
          <div class="stat-icon">🏁</div>
          <h3>Tracks</h3>
          <div class="stat-number">{tracks.length}</div>
          <div class="stat-actions">
            <Button href="/tracks" {link} variant="outlined">View All</Button>
            <Button href="/tracks/new" {link} variant="raised" color="primary">Add Track</Button>
          </div>
        </Card>
      </Cell>
    </LayoutGrid>

    {#if sessions.length > 0}
      <div class="recent-section">
        <h2>Recent Sessions</h2>
        <div class="recent-sessions">
          {#each sessions.slice(0, 3) as session}
            <Card style="padding: 1.5rem;">
              <div class="session-date">
                {new Date(session.date).toLocaleDateString()}
              </div>
              <div class="session-details">
                <div><strong>Session:</strong> {session.session}</div>
                <div><strong>Laps:</strong> {session.laps}</div>
                {#if session.fastest}
                  <div><strong>Best Lap:</strong> {session.fastest}s</div>
                {/if}
              </div>
              <Button href="/sessions/{session.id}" {link} variant="raised" style="background-color: #28a745; margin-top: 1rem;">View</Button>
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
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    color: #333;
    margin: 0;
    font-size: 2.5rem;
    font-weight: 600;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid #f5c6cb;
    margin-bottom: 2rem;
  }

  .stat-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1.25rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 1.5rem;
  }

  .stat-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
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

  .session-date {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }

  .session-details {
    margin-bottom: 1rem;
  }

  .session-details div {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
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
    .dashboard {
      padding: 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .recent-sessions {
      grid-template-columns: 1fr;
    }
  }
</style>
