<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserEngines, deleteEngine, retireEngine } from '../lib/engines.js';

  let engines = [];
  let loading = true;
  let error = '';

  const loadEngines = async () => {
    try {
      loading = true;
      engines = await getUserEngines();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (engineId) => {
    if (!confirm('Are you sure you want to delete this engine? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEngine(engineId);
      await loadEngines(); // Reload the list
    } catch (err) {
      error = err.message;
    }
  };

  const handleRetire = async (engineId) => {
    if (!confirm('Are you sure you want to retire this engine?')) {
      return;
    }

    try {
      await retireEngine(engineId);
      await loadEngines(); // Reload the list
    } catch (err) {
      error = err.message;
    }
  };

  onMount(() => {
    loadEngines();
  });
</script>

<div class="engines">
  <div class="header">
    <h1>Engines</h1>
    <a href="/engines/new" use:link class="add-btn">+ Add New Engine</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading engines...</div>
  {:else if engines.length === 0}
    <div class="empty">
      <h3>No engines found</h3>
      <p>Get started by adding your first engine.</p>
      <a href="/engines/new" use:link class="add-btn">Add Engine</a>
    </div>
  {:else}
    <div class="engines-grid">
      {#each engines as engine (engine.id)}
        <div class="engine-card" class:retired={engine.retired}>
          <div class="engine-header">
            <h3>{engine.make} {engine.model}</h3>
            {#if engine.retired}
              <span class="retired-badge">Retired</span>
            {/if}
          </div>
          
          <div class="engine-details">
            {#if engine.serialNumber}
              <div class="detail">
                <strong>Serial Number:</strong> {engine.serialNumber}
              </div>
            {/if}
            {#if engine.sealNumber}
              <div class="detail">
                <strong>Seal Number:</strong> {engine.sealNumber}
              </div>
            {/if}
            {#if engine.purchaseDate}
              <div class="detail">
                <strong>Purchase Date:</strong> {new Date(engine.purchaseDate).toLocaleDateString()}
              </div>
            {/if}
            {#if engine.notes}
              <div class="detail">
                <strong>Notes:</strong> {engine.notes}
              </div>
            {/if}
          </div>

          <div class="engine-actions">
            <a href="/engines/{engine.id}" use:link class="edit-btn">Edit</a>
            {#if !engine.retired}
              <button on:click={() => handleRetire(engine.id)} class="retire-btn">
                Retire
              </button>
            {/if}
            <button on:click={() => handleDelete(engine.id)} class="delete-btn">
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .engines {
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

  .engines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .engine-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .engine-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .engine-card.retired {
    opacity: 0.7;
    border-color: #dc3545;
  }

  .engine-header {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .engine-card.retired .engine-header {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }

  .engine-header h3 {
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

  .engine-details {
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

  .engine-actions {
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
    .engines {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .engines-grid {
      grid-template-columns: 1fr;
    }

    .engine-actions {
      flex-wrap: wrap;
    }
  }
</style>