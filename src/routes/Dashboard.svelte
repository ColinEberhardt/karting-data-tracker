<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserTyres, deleteTyre } from '../lib/tyres.js';

  let tyres = [];
  let loading = true;
  let error = '';

  const loadTyres = async () => {
    try {
      loading = true;
      tyres = await getUserTyres();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (tyreId) => {
    if (!confirm('Are you sure you want to delete this tyre?')) {
      return;
    }

    try {
      await deleteTyre(tyreId);
      tyres = tyres.filter(tyre => tyre.id !== tyreId);
    } catch (err) {
      error = err.message;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  onMount(loadTyres);
</script>

<div class="dashboard">
  <div class="header">
    <h1>My Tyres</h1>
    <a href="/tyres/new" use:link class="add-btn">+ Add New Tyre</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading tyres...</div>
  {:else if tyres.length === 0}
    <div class="empty-state">
      <h2>No tyres yet</h2>
      <p>Start tracking your go-kart tyres by adding your first entry.</p>
      <a href="/tyres/new" use:link class="add-btn">Add Your First Tyre</a>
    </div>
  {:else}
    <div class="tyres-grid">
      {#each tyres as tyre (tyre.id)}
        <div class="tyre-card">
          <div class="tyre-header">
            <h3>{tyre.brand}</h3>
            <div class="tyre-actions">
              <a href="/tyres/{tyre.id}" use:link class="edit-btn">Edit</a>
              <button on:click={() => handleDelete(tyre.id)} class="delete-btn">Delete</button>
            </div>
          </div>
          <p class="description">{tyre.description}</p>
          <div class="tyre-meta">
            <small>Created: {formatDate(tyre.createdAt)}</small>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard {
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

  h1 {
    color: #495057;
    margin: 0;
  }

  .add-btn {
    background-color: #28a745;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-weight: 500;
  }

  .add-btn:hover {
    background-color: #218838;
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
    margin-bottom: 2rem;
  }

  .tyres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .tyre-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
  }

  .tyre-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .tyre-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .tyre-header h3 {
    margin: 0;
    color: #495057;
    font-size: 1.25rem;
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
