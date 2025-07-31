<script>
  import { onMount } from 'svelte';
  import { user } from '../lib/stores.js';
  import { isAdmin } from '../lib/stores.js';
  import { getAllTyres } from '../lib/tyres.js';
  import { push } from 'svelte-spa-router';

  let tyres = [];
  let loading = true;
  let error = '';

  const loadAllTyres = async () => {
    if (!isAdmin($user)) {
      push('/tyres');
      return;
    }

    try {
      loading = true;
      tyres = await getAllTyres();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  onMount(loadAllTyres);
</script>

{#if !isAdmin($user)}
  <div class="access-denied">
    <h1>Access Denied</h1>
    <p>You don't have permission to view this page.</p>
  </div>
{:else}
  <div class="admin-tyres">
    <div class="header">
      <h1>🔧 Admin: All Tyres</h1>
      <p class="admin-note">View all tyres from all users</p>
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if loading}
      <div class="loading">Loading all tyres...</div>
    {:else if tyres.length === 0}
      <div class="empty-state">
        <h2>No tyres in the system</h2>
        <p>No users have added any tyres yet.</p>
      </div>
    {:else}
      <div class="tyres-table">
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Description</th>
              <th>User ID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {#each tyres as tyre (tyre.id)}
              <tr>
                <td class="brand">{tyre.brand}</td>
                <td class="description">{tyre.description}</td>
                <td class="user-id">{tyre.userId}</td>
                <td class="date">{formatDate(tyre.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <p><strong>Total tyres:</strong> {tyres.length}</p>
        <p><strong>Unique users:</strong> {new Set(tyres.map(t => t.userId)).size}</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .admin-tyres {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    color: #495057;
    margin: 0 0 0.5rem 0;
  }

  .admin-note {
    color: #ffc107;
    font-weight: 500;
    margin: 0;
    background-color: #fff3cd;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid #ffeaa7;
    display: inline-block;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
    font-size: 1.1rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
  }

  .empty-state h2 {
    color: #6c757d;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #6c757d;
  }

  .tyres-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #dee2e6;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background-color: #f8f9fa;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    vertical-align: top;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  .brand {
    font-weight: 500;
    color: #007bff;
  }

  .description {
    max-width: 300px;
    word-wrap: break-word;
    color: #495057;
  }

  .user-id {
    font-family: monospace;
    font-size: 0.875rem;
    color: #6c757d;
    background-color: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
  }

  .date {
    color: #6c757d;
    font-size: 0.875rem;
  }

  .summary {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #dee2e6;
    display: flex;
    gap: 2rem;
  }

  .summary p {
    margin: 0;
    color: #495057;
  }

  .access-denied {
    text-align: center;
    padding: 3rem;
  }

  .access-denied h1 {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  .access-denied p {
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
    .admin-tyres {
      padding: 1rem;
    }

    .tyres-table {
      overflow-x: auto;
    }

    table {
      min-width: 600px;
    }

    .summary {
      flex-direction: column;
      gap: 0.5rem;
    }

    th, td {
      padding: 0.75rem 0.5rem;
    }

    .description {
      max-width: 200px;
    }
  }
</style>
