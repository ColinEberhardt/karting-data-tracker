<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserTyres, deleteTyre, retireTyre } from '../lib/tyres.js';

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
    if (!confirm('Are you sure you want to delete this tyre? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTyre(tyreId);
      await loadTyres(); // Reload the list
    } catch (err) {
      error = err.message;
    }
  };

  const handleRetire = async (tyreId) => {
    if (!confirm('Are you sure you want to retire this tyre?')) {
      return;
    }

    try {
      await retireTyre(tyreId);
      await loadTyres(); // Reload the list
    } catch (err) {
      error = err.message;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  onMount(() => {
    loadTyres();
  });
</script>

<div class="tyres">
  <div class="header">
    <h1>Tyres</h1>
    <a href="/tyres/new" use:link class="add-btn">+ Add New Tyre</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading tyres...</div>
  {:else if tyres.length === 0}
    <div class="empty">
      <h3>No tyres found</h3>
      <p>Get started by adding your first tyre.</p>
      <a href="/tyres/new" use:link class="add-btn">Add Tyre</a>
    </div>
  {:else}
    <div class="tyres-grid">
      {#each tyres as tyre (tyre.id)}
        <div class="tyre-card" class:retired={tyre.retired}>
          <div class="tyre-header">
            <h3>{tyre.name}</h3>
            {#if tyre.retired}
              <span class="retired-badge">Retired</span>
            {/if}
          </div>
          
          <div class="tyre-details">
            <div class="detail">
              <strong>Make/Type:</strong> {tyre.make} - {tyre.type}
            </div>
            {#if tyre.description}
              <div class="detail">
                <strong>Description:</strong> {tyre.description}
              </div>
            {/if}
            {#if tyre.compound}
              <div class="detail">
                <strong>Compound:</strong> {tyre.compound}
              </div>
            {/if}
            {#if tyre.size}
              <div class="detail">
                <strong>Size:</strong> {tyre.size}
              </div>
            {/if}
            <div class="detail">
              <strong>Created:</strong> {formatDate(tyre.createdAt)}
            </div>
          </div>

          <div class="tyre-actions">
            <a href="/tyres/{tyre.id}" use:link class="edit-btn">Edit</a>
            {#if !tyre.retired}
              <button on:click={() => handleRetire(tyre.id)} class="retire-btn">
                Retire
              </button>
            {/if}
            <button on:click={() => handleDelete(tyre.id)} class="delete-btn">
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tyres {
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
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
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
    padding: 3rem;
    color: #666;
    font-size: 1.1rem;
  }

  .empty {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .empty h3 {
    margin-bottom: 1rem;
    color: #333;
  }

  .tyres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .tyre-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .tyre-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .tyre-card.retired {
    opacity: 0.7;
    border-color: #dc3545;
  }

  .tyre-header {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tyre-card.retired .tyre-header {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }

  .tyre-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .retired-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .tyre-details {
    padding: 1.5rem;
  }

  .detail {
    margin-bottom: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .detail:last-child {
    margin-bottom: 0;
  }

  .detail strong {
    color: #495057;
    min-width: 120px;
  }

  .tyre-actions {
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 0.75rem;
  }

  .edit-btn {
    background-color: #28a745;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .edit-btn:hover {
    background-color: #218838;
  }

  .retire-btn {
    background-color: #ffc107;
    color: #212529;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retire-btn:hover {
    background-color: #e0a800;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-btn:hover {
    background-color: #c82333;
  }

  @media (max-width: 768px) {
    .tyres {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .tyres-grid {
      grid-template-columns: 1fr;
    }

    .tyre-actions {
      flex-wrap: wrap;
    }
  }
</style>