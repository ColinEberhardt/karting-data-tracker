<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserTyres, deleteTyre, retireTyre } from '../lib/tyres.js';
  import { getUserSessions } from '../lib/sessions.js';
  import { calculateItemStats, mergeItemsWithStats } from '../lib/sessionStats.js';
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
      const sessions = await getUserSessions();
      
      // Calculate tyre statistics from sessions
      const tyreStats = calculateItemStats(sessions, 'tyreId');
      
      // Merge tyre data with statistics
      const tyresWithStats = mergeItemsWithStats(rawTyres, tyreStats);
      
      // Sort tyres: active tyres first (by createdAt desc), then retired tyres (by createdAt desc)
      tyres = tyresWithStats.sort((a, b) => {
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
          <Card class="card-hover {tyre.retired ? 'card-retired' : ''}">
            <div class="card-header {tyre.retired ? 'card-header-retired' : 'card-header-active'}">
              <h3>{tyre.name}</h3>
              {#if tyre.retired}
                <span class="retired-badge">Retired</span>
              {/if}
            </div>
            
            <div class="card-details">
              <div class="detail">
                <strong>Make/Type:</strong> {tyre.make} - {tyre.type}
              </div>
              <div class="detail">
                <strong>Laps:</strong> {tyre.totalLaps}
              </div>
              <div class="detail">
                <strong>Sessions:</strong> {tyre.sessions}
              </div>
              {#if tyre.description}
                <div class="detail">
                  <strong>Description:</strong> {tyre.description}
                </div>
              {/if}
            </div>

            <div class="card-actions">
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