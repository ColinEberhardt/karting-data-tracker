<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserTracks, deleteTrack } from '../lib/tracks.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

  let tracks = [];
  let loading = true;
  let error = '';

  const loadTracks = async () => {
    try {
      loading = true;
      tracks = await getUserTracks();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (trackId) => {
    if (!confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      await deleteTrack(trackId);
      tracks = tracks.filter(track => track.id !== trackId);
    } catch (err) {
      error = err.message;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const formatCoordinate = (value, type) => {
    if (value === null || value === undefined) return '';
    const direction = type === 'latitude' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(6)}°${direction}`;
  };

  onMount(loadTracks);
</script>

<div class="tracks">
  <div class="header">
    <h1>My Tracks</h1>
    <a href="/tracks/new" use:link class="add-btn">+ Add New Track</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading tracks...</p>
    </div>
  {:else if tracks.length === 0}
    <div class="empty-state">
      <h2>No tracks yet</h2>
      <p>Start tracking your racing locations by adding your first track.</p>
      <a href="/tracks/new" use:link class="add-btn">Add Your First Track</a>
    </div>
  {:else}
    <div class="tracks-grid">
      {#each tracks as track (track.id)}
        <Card style="padding: 1.5rem;">
          <div class="track-header">
            <h3>{track.name}</h3>
            <div class="track-actions">
              <Button href="/tracks/{track.id}" tag="a" use={[link]} variant="raised" style="background-color: #28a745;">Edit</Button>
              <Button onclick={() => handleDelete(track.id)} variant="raised" style="background-color: #dc3545;">Delete</Button>
            </div>
          </div>
          <div class="track-location">
            <div class="coordinate">
              <span class="label">Latitude:</span>
              <span class="value">{formatCoordinate(track.latitude, 'latitude')}</span>
            </div>
            <div class="coordinate">
              <span class="label">Longitude:</span>
              <span class="value">{formatCoordinate(track.longitude, 'longitude')}</span>
            </div>
          </div>
          <div class="track-meta">
            <small>Created: {formatDate(track.createdAt)}</small>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tracks {
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
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
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

  .empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  .empty-state h2 {
    color: #495057;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #6c757d;
    margin-bottom: 2rem;
  }

  .tracks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .track-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .track-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
    flex: 1;
    margin-right: 1rem;
  }

  .track-actions {
    display: flex;
    gap: 0.5rem;
  }

  .track-location {
    margin-bottom: 1rem;
  }

  .coordinate {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .coordinate:last-child {
    margin-bottom: 0;
  }

  .label {
    font-weight: 500;
    color: #495057;
  }

  .value {
    color: #007bff;
    font-family: monospace;
  }

  .track-meta {
    color: #6c757d;
    font-size: 0.875rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }

  @media (max-width: 768px) {
    .tracks {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .tracks-grid {
      grid-template-columns: 1fr;
    }

    .track-actions {
      flex-direction: column;
    }
  }
</style>
