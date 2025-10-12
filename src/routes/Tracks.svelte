<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getUserTracks, deleteTrack } from '../lib/tracks.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import LayoutGrid, { Cell } from '@smui/layout-grid';

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

<div class="container container-lg">
  <div class="page-header">
    <h1>My Tracks</h1>
    <Button href="/tracks/new" tag="a" use={[link]} variant="raised" style="background-color: #007bff;">+ Add New Track</Button>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading tracks...</p>
    </div>
  {:else if tracks.length === 0}
    <div class="empty-state">
      <h2>No tracks yet</h2>
      <p>Start tracking your racing locations by adding your first track.</p>
      <Button href="/tracks/new" tag="a" use={[link]} variant="raised" style="background-color: #007bff;">Add Your First Track</Button>
    </div>
  {:else}
    <LayoutGrid>
      {#each tracks as track (track.id)}
        <Cell spanDevices={{ desktop: 4, tablet: 8, phone: 4 }}>
          <Card class="card-hover track-card">
            {#if track.latitude && track.longitude}
              <img 
                src="https://maps.googleapis.com/maps/api/staticmap?center={track.latitude},{track.longitude}&zoom=16&size=300x200&maptype=satellite&key=AIzaSyAls1lFlW5xpL4JGB9bss985id7nURl-c4"
                alt="Satellite view of {track.name}"
                class="track-map"
              />
            {:else}
              <div class="no-location">No location data available</div>
            {/if}
            
            <div class="card-overlay">
              <div class="card-header">
                <h3>{track.name}</h3>
              </div>
              
              <div class="card-actions">
                <a href="/tracks/{track.id}" use:link class="icon-button" title="Edit">
                  ✎
                </a>
                <a href="#" on:click|preventDefault={() => handleDelete(track.id)} class="icon-button delete-button" title="Delete">
                  ✕
                </a>
              </div>
            </div>
          </Card>
        </Cell>
      {/each}
    </LayoutGrid>
  {/if}
</div>

<style>
  .track-map {
    width: 100%;
    height: 100%;
    min-height: 200px;
    object-fit: cover;
    object-position: center top;
    filter: brightness(1.4) contrast(2);
  }

  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.7) 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
  }

  .card-header h3 {
    color: white;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }

  .no-location {
    padding: 2rem;
    background-color: #f8f9fa;
    color: #6c757d;
    text-align: center;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
