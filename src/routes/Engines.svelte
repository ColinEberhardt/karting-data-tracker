<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserEngines, deleteEngine, retireEngine } from '../lib/engines.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

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
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading engines...</p>
    </div>
  {:else if engines.length === 0}
    <div class="empty">
      <h3>No engines found</h3>
      <p>Get started by adding your first engine.</p>
      <a href="/engines/new" use:link class="add-btn">Add Engine</a>
    </div>
  {:else}
    <div class="engines-grid">
      {#each engines as engine (engine.id)}
        <Card class="engine-card" style={engine.retired ? 'opacity: 0.7; border: 1px solid #dc3545;' : ''}>
          <div class="engine-header" style={engine.retired ? 'background: linear-gradient(135deg, #dc3545, #c82333);' : 'background: linear-gradient(135deg, #007bff, #0056b3);'}>
            <h3>{engine.name || `${engine.make} ${engine.model}`}</h3>
            {#if engine.retired}
              <span class="retired-badge">Retired</span>
            {/if}
          </div>
          
          <div class="engine-details">
            {#if engine.name}
              <div class="detail">
                <strong>Make/Model:</strong> {engine.make} {engine.model}
              </div>
            {/if}
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
            <Button href="/engines/{engine.id}" tag="a" use={[link]} variant="raised" style="background-color: #28a745;">Edit</Button>
            {#if !engine.retired}
              <Button onclick={() => handleRetire(engine.id)} variant="raised" style="background-color: #ffc107; color: #212529;">
                Retire
              </Button>
            {/if}
            <Button onclick={() => handleDelete(engine.id)} variant="raised" style="background-color: #dc3545;">
              Delete
            </Button>
          </div>
        </Card>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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

  :global(.engine-card) {
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  :global(.engine-card:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .engine-header {
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
