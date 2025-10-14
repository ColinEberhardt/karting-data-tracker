<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { getUserTyres, deleteTyre, retireTyre } from '../lib/tyres.js';
  import { getUserSessions } from '../lib/sessions.js';
  import { calculateItemStats, mergeItemsWithStats } from '../lib/sessionStats.js';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

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

  const handleRowClick = (tyre) => {
    if (tyre.sessions > 0) {
      const filters = encodeURIComponent(JSON.stringify([{ type: 'tyre', id: tyre.id, label: tyre.name }]));
      push(`/sessions?filters=${filters}`);
    }
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
    <div class="table-container">
      <DataTable style="width: 100%;">
        <Head>
          <Row>
            <Cell>Name</Cell>
            <Cell>Make</Cell>
            <Cell>Type</Cell>
            <Cell>Laps</Cell>
            <Cell>Sessions</Cell>
            <Cell>Status</Cell>
            <Cell class="actions-header">Actions</Cell>
          </Row>
        </Head>
        <Body>
          {#each tyres as tyre (tyre.id)}
            <Row class="tyre-row {tyre.retired ? 'retired-row' : ''}">
              <div 
                class="clickable-row {tyre.sessions > 0 ? 'has-sessions' : ''}" 
                on:click={() => handleRowClick(tyre)} 
                on:keydown={(e) => e.key === 'Enter' && handleRowClick(tyre)} 
                tabindex="0" 
                role="button"
              >
                <Cell>{tyre.name}</Cell>
                <Cell>{tyre.make}</Cell>
                <Cell>{tyre.type}</Cell>
                <Cell>{tyre.totalLaps}</Cell>
                <Cell>{tyre.sessions}</Cell>
                <Cell>
                  {#if tyre.retired}
                    <span class="retired-badge">Retired</span>
                  {:else}
                    <span class="active-badge">Active</span>
                  {/if}
                </Cell>
                <Cell>
                  <div class="action-buttons">
                    <a href="/tyres/{tyre.id}" use:link class="text-button" on:click|stopPropagation>
                      Edit
                    </a>
                    {#if !tyre.retired}
                      <button on:click|stopPropagation|preventDefault={() => handleRetire(tyre.id)} class="text-button retire-button">
                        Retire
                      </button>
                    {/if}
                    <button on:click|stopPropagation|preventDefault={() => handleDelete(tyre.id)} class="text-button delete-button">
                      Delete
                    </button>
                  </div>
                </Cell>
              </div>
            </Row>
          {/each}
        </Body>
      </DataTable>
    </div>
  {/if}
</div>

<style>
  .table-container {
    margin-top: 24px;
  }

  :global(.tyre-row) {
    position: relative;
  }

  :global(.tyre-row td) {
    vertical-align: middle;
    font-size: 16px;
  }

  .clickable-row {
    display: contents;
    cursor: default;
  }

  .clickable-row.has-sessions {
    cursor: pointer;
  }

  .clickable-row.has-sessions:hover :global(td) {
    background-color: rgba(0, 0, 0, 0.04);
  }

  :global(.retired-row td) {
    opacity: 0.6;
  }

  :global(.actions-header) {
    text-align: right;
  }

  .retired-badge {
    display: inline-block;
    padding: 2px 8px;
    background-color: #9e9e9e;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .active-badge {
    display: inline-block;
    padding: 2px 8px;
    background-color: #4caf50;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .text-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 6px 12px;
    color: #1976d2;
    text-decoration: none;
    transition: all 0.2s;
    border-radius: 4px;
    font-weight: 500;
  }

  .text-button:hover {
    background-color: rgba(25, 118, 210, 0.08);
    text-decoration: underline;
  }

  .retire-button {
    color: #ff9800;
  }

  .retire-button:hover {
    background-color: rgba(255, 152, 0, 0.08);
  }

  .delete-button {
    color: #f44336;
  }

  .delete-button:hover {
    background-color: rgba(244, 67, 54, 0.08);
  }
</style>