<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserEngines, deleteEngine, retireEngine } from '../lib/engines.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import LayoutGrid, { Cell } from '@smui/layout-grid';

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

<div class="container container-lg">
  <div class="page-header">
    <h1>Engines</h1>
    <Button href="/engines/new" tag="a" use={[link]} variant="raised" color="primary">+ Add New Engine</Button>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading engines...</p>
    </div>
  {:else if engines.length === 0}
    <div class="empty-state">
      <h3>No engines found</h3>
      <p>Get started by adding your first engine.</p>
      <Button href="/engines/new" tag="a" use={[link]} variant="raised" color="primary">Add Engine</Button>
    </div>
  {:else}
    <LayoutGrid>
      {#each engines as engine (engine.id)}
        <Cell spanDevices={{ desktop: 4, tablet: 8, phone: 4 }}>
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
        </Cell>
      {/each}
    </LayoutGrid>
  {/if}
</div>

<style>
  :global(.engine-card) {
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
    height: 100%;
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
    flex-wrap: wrap;
  }
</style>
