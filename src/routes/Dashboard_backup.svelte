<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserEngines } from '../lib/engines.js';
  import { getUserSessions } from '../lib/sessions.js';
  import { getUserTracks } from '../lib/tracks.js';

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
    <div class="loading">Loading dashboard...</div>
  {:else}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏁</div>
        <div class="stat-content">
          <h3>Sessions</h3>
          <div class="stat-number">{sessions.length}</div>
          <div class="stat-actions">
            <a href="/sessions" use:link class="view-btn">View All</a>
            <a href="/sessions/new" use:link class="add-btn">Add Session</a>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛞</div>
        <div class="stat-content">
          <h3>Tyres</h3>
          <div class="stat-number">{tyres.length}</div>
          <div class="stat-actions">
            <a href="/tyres" use:link class="view-btn">View All</a>
            <a href="/tyres/new" use:link class="add-btn">Add Tyre</a>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚙️</div>
        <div class="stat-content">
          <h3>Engines</h3>
          <div class="stat-number">{engines.length}</div>
          <div class="stat-actions">
            <a href="/engines" use:link class="view-btn">View All</a>
            <a href="/engines/new" use:link class="add-btn">Add Engine</a>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏁</div>
        <div class="stat-content">
          <h3>Tracks</h3>
          <div class="stat-number">{tracks.length}</div>
          <div class="stat-actions">
            <a href="/tracks" use:link class="view-btn">View All</a>
            <a href="/tracks/new" use:link class="add-btn">Add Track</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Sessions -->
    {#if sessions.length > 0}
      <div class="recent-section">
        <h2>Recent Sessions</h2>
        <div class="recent-sessions">
          {#each sessions.slice(0, 3) as session}
            <div class="session-card">
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
              <a href="/sessions/{session.id}" use:link class="edit-session-btn">View</a>
            </div>
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
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid #f5c6cb;
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .stat-content h3 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1.25rem;
    text-align: center;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .stat-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .view-btn, .add-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .view-btn {
    background-color: #6c757d;
    color: white;
  }

  .view-btn:hover {
    background-color: #5a6268;
  }

  .add-btn {
    background-color: #007bff;
    color: white;
  }

  .add-btn:hover {
    background-color: #0056b3;
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

  .session-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .session-card:hover {
    transform: translateY(-2px);
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

  .edit-session-btn {
    background-color: #28a745;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .edit-session-btn:hover {
    background-color: #218838;
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

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-actions {
      flex-direction: column;
    }

    .recent-sessions {
      grid-template-columns: 1fr;
    }
  }
</style>
  }

  .tyre-actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn {
    background-color: #007bff;
    color: white;
    text-decoration: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .edit-btn:hover {
    background-color: #0056b3;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-btn:hover {
    background-color: #c82333;
  }

  .description {
    color: #6c757d;
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  .tyre-meta {
    border-top: 1px solid #dee2e6;
    padding-top: 0.75rem;
  }

  .tyre-meta small {
    color: #6c757d;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .tyre-header {
      flex-direction: column;
      gap: 1rem;
    }

    .tyre-actions {
      justify-content: flex-end;
    }
  }
</style>
