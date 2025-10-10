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
          <Card class="card-hover {engine.retired ? 'card-retired' : ''}">
            <div class="card-header {engine.retired ? 'card-header-retired' : 'card-header-active'}">
              <h3>{engine.name || `${engine.make} ${engine.model}`}</h3>
              {#if engine.retired}
                <span class="retired-badge">Retired</span>
              {/if}
            </div>
            
            <div class="card-details">
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

            <div class="card-actions">
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
