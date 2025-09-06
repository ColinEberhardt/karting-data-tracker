<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserSessions, deleteSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';

  let sessions = [];
  let tyres = [];
  let loading = true;
  let error = '';

  const loadData = async () => {
    try {
      loading = true;
      [sessions, tyres] = await Promise.all([
        getUserSessions(),
        getUserTyres()
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const d = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
    return d.toLocaleString();
  };

  const getTyreName = (tyreId) => {
    const tyre = tyres.find(t => t.id === tyreId);
    return tyre ? `${tyre.make} ${tyre.type}` : 'Unknown Tyre';
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
    <div class="sessions-grid">
      {#each sessions as session (session.id)}
        <div class="session-card">
          <div class="session-header">
            <h3>{formatDateTime(session.dateTime)}</h3>
            <div class="actions">
              <a href="/sessions/{session.id}" use:link class="edit-btn">Edit</a>
              <button on:click={() => handleDelete(session.id)} class="delete-btn">Delete</button>
            </div>
          </div>
          
          <div class="session-details">
            <div class="detail-item">
              <span class="label">Rear Sprocket:</span>
              <span class="value">{session.rearSprocket}T</span>
            </div>
            <div class="detail-item">
              <span class="label">Front Sprocket:</span>
              <span class="value">{session.frontSprocket}T</span>
            </div>
            <div class="detail-item">
              <span class="label">Tyre:</span>
              <span class="value">{getTyreName(session.tyreId)}</span>
            </div>
          </div>
        </div>
      {/each}
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

  .sessions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .session-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .session-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .session-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
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

  .session-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    font-weight: 500;
    color: #666;
  }

  .value {
    color: #333;
    font-weight: 600;
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

    .sessions-grid {
      grid-template-columns: 1fr;
    }

    .session-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .actions {
      justify-content: flex-end;
    }
  }
</style>
