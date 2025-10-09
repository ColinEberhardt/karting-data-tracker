<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserSessions, deleteSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';

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
    <a href="/sessions/new" use:link class="add-btn">+ Add New Session</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading sessions...</div>
  {:else if sessions.length === 0}
    <div class="empty-state">
      <h2>No Sessions Yet</h2>
      <p>Start tracking your karting sessions!</p>
      <a href="/sessions/new" use:link class="add-btn">Add Your First Session</a>
    </div>
  {:else}
    <div class="table-container">
      <table class="sessions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Session</th>
            <th>Circuit</th>
            <th>Laps</th>
            <th>Fastest Lap</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each sessions as session (session.id)}
            <tr class="session-row" on:click={() => window.location.hash = `/sessions/view/${session.id}`}>
              <td>{formatDate(session.date)}</td>
              <td>{session.session}</td>
              <td>{getTrackName(session.circuitId)}</td>
              <td>{session.laps}</td>
              <td>{formatFastestLap(session.fastest)}</td>
              <td class="actions-cell" on:click|stopPropagation>
                <a href="/sessions/edit/{session.id}" use:link class="edit-btn">Edit</a>
                <button on:click={() => handleDelete(session.id)} class="delete-btn">Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
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

  .add-btn {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .add-btn:hover {
    background-color: #0056b3;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid #f5c6cb;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
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
  }

  .sessions-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
  }

  .sessions-table th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 1rem;
    text-align: left;
    border-bottom: 2px solid #dee2e6;
  }

  .sessions-table td {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .session-row {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .session-row:hover {
    background-color: #f8f9fa;
  }

  .actions-cell {
    cursor: default;
  }

  .actions-cell .edit-btn,
  .actions-cell .delete-btn {
    margin-right: 0.5rem;
  }

  .edit-btn {
    background-color: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .edit-btn:hover {
    background-color: #218838;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .delete-btn:hover {
    background-color: #c82333;
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

    .sessions-table th,
    .sessions-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
    }

    .actions-cell .edit-btn,
    .actions-cell .delete-btn {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
  }
</style>
