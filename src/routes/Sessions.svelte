<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserSessions, deleteSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

  let sessions = [];
  let tyres = [];
  let tracks = [];
  let engines = [];
  let loading = true;
  let error = '';

  const loadData = async () => {
    try {
      loading = true;
      [sessions, tyres, tracks, engines] = await Promise.all([
        getUserSessions(),
        getUserTyres(),
        getUserTracks(),
        getUserEngines()
      ]);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      sessions = sessions.filter(session => session.id !== sessionId);
    } catch (err) {
      error = err.message;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const formatFastestLap = (time) => {
    if (!time) return '-';
    return `${time.toFixed(3)}s`;
  };

  const getTrackName = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : 'Unknown Track';
  };

  const getTyreName = (tyreId) => {
    const tyre = tyres.find(t => t.id === tyreId);
    return tyre ? (tyre.name || `${tyre.make} ${tyre.type}`) : 'Unknown Tyre';
  };

  const getEngineName = (engineId) => {
    const engine = engines.find(e => e.id === engineId);
    return engine ? (engine.name || `${engine.make} ${engine.model}`) : 'Unknown Engine';
  };

  onMount(loadData);
</script>

<div class="sessions-dashboard">
  <div class="header">
    <h1>My Karting Sessions</h1>
    <Button href="/sessions/new" tag="a" use={[link]} variant="raised" color="primary">+ Add New Session</Button>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading sessions...</p>
    </div>
  {:else if sessions.length === 0}
    <div class="empty-state">
      <h2>No Sessions Yet</h2>
      <p>Start tracking your karting sessions!</p>
      <Button href="/sessions/new" tag="a" use={[link]} variant="raised" color="primary">Add Your First Session</Button>
    </div>
  {:else}
    <div class="table-container">
      <DataTable style="width: 100%;">
        <Head>
          <Row>
            <Cell>Date</Cell>
            <Cell>Session</Cell>
            <Cell>Circuit</Cell>
            <Cell>Laps</Cell>
            <Cell>Fastest Lap</Cell>
            <Cell>Actions</Cell>
          </Row>
        </Head>
        <Body>
          {#each sessions as session (session.id)}
            <Row class="session-row" on:click={() => window.location.hash = `/sessions/view/${session.id}`}>
              <Cell>{formatDate(session.date)}</Cell>
              <Cell>{session.session}</Cell>
              <Cell>{getTrackName(session.circuitId)}</Cell>
              <Cell>{session.laps}</Cell>
              <Cell>{formatFastestLap(session.fastest)}</Cell>
              <Cell>
                <div class="actions-cell" on:click|stopPropagation>
                  <Button href="/sessions/edit/{session.id}" tag="a" use={[link]} variant="raised" style="background-color: #28a745; margin-right: 0.5rem;">Edit</Button>
                  <Button onclick={() => handleDelete(session.id)} variant="raised" style="background-color: #dc3545;">Delete</Button>
                </div>
              </Cell>
            </Row>
          {/each}
        </Body>
      </DataTable>
    </div>
  {/if}
</div>

<style>
  .sessions-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    margin: 0;
    color: #333;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f8f9fa;
    border-radius: 10px;
    margin-top: 2rem;
  }

  .empty-state h2 {
    color: #666;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #888;
    margin-bottom: 2rem;
  }

  .table-container {
    margin-top: 2rem;
    overflow-x: auto;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background: white;
  }

  :global(.session-row) {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  :global(.session-row:hover) {
    background-color: #f8f9fa;
  }

  .actions-cell {
    cursor: default;
  }

  @media (max-width: 768px) {
    .sessions-dashboard {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .table-container {
      margin-top: 1rem;
    }
  }
</style>
