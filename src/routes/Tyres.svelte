<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserTyres, deleteTyre, retireTyre } from '../lib/tyres.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import LayoutGrid, { Cell } from '@smui/layout-grid';

  let tyres = [];
  let loading = true;
  let error = '';

  const loadTyres = async () => {
    try {
      loading = true;
      const rawTyres = await getUserTyres();
      
      // Sort tyres: active tyres first (by createdAt desc), then retired tyres (by createdAt desc)
      tyres = rawTyres.sort((a, b) => {
        // If one is retired and the other isn't, retired goes to bottom
        if (a.retired !== b.retired) {
          return a.retired ? 1 : -1;
        }
        
        // Both have same retirement status, sort by createdAt (most recent first)
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      });
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

<div class="container container-lg">
  <div class="page-header">
    <h1>Tyres</h1>
    <Button href="/tyres/new" tag="a" use={[link]} variant="raised" color="primary">+ Add New Tyre</Button>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading tyres...</p>
    </div>
  {:else if tyres.length === 0}
    <div class="empty-state">
      <h3>No tyres found</h3>
      <p>Get started by adding your first tyre.</p>
      <Button href="/tyres/new" tag="a" use={[link]} variant="raised" color="primary">Add Tyre</Button>
    </div>
  {:else}
    <LayoutGrid>
      {#each tyres as tyre (tyre.id)}
        <Cell spanDevices={{ desktop: 4, tablet: 4, phone: 4 }}>
          <Card class="tyre-card" style={tyre.retired ? 'opacity: 0.7; border: 1px solid #dc3545;' : ''}>
            <div class="tyre-header" style={tyre.retired ? 'background: linear-gradient(135deg, #dc3545, #c82333);' : 'background: linear-gradient(135deg, #007bff, #0056b3);'}>
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
              <Button href="/tyres/{tyre.id}" tag="a" use={[link]} variant="raised" style="background-color: #28a745;">Edit</Button>
              {#if !tyre.retired}
                <Button onclick={() => handleRetire(tyre.id)} variant="raised" style="background-color: #ffc107; color: #212529;">
                  Retire
                </Button>
              {/if}
              <Button onclick={() => handleDelete(tyre.id)} variant="raised" style="background-color: #dc3545;">
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
  .tyre-header {
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  @media (max-width: 768px) {
    .tyre-actions {
      flex-wrap: wrap;
    }
  }
</style>
