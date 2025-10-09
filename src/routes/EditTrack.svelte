<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { getUserTracks, updateTrack, getCurrentLocation } from '../lib/tracks.js';
  import Card from '@smui/card';
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

  export let params = {};
  
  let name = '';
  let latitude = '';
  let longitude = '';
  let loading = false;
  let error = '';
  let gettingLocation = false;
  let trackLoading = true;

  const trackId = params.id;

  const loadTrack = async () => {
    try {
      trackLoading = true;
      const tracks = await getUserTracks();
      const track = tracks.find(t => t.id === trackId);
      
      if (!track) {
        error = 'Track not found';
        return;
      }

      name = track.name || '';
      latitude = (track.latitude || 0).toString();
      longitude = (track.longitude || 0).toString();
    } catch (err) {
      error = err.message;
    } finally {
      trackLoading = false;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      error = 'Please enter a track name';
      return;
    }

    if (!latitude || !longitude) {
      error = 'Please enter both latitude and longitude';
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      error = 'Please enter valid numeric coordinates';
      return;
    }

    if (lat < -90 || lat > 90) {
      error = 'Latitude must be between -90 and 90 degrees';
      return;
    }

    if (lng < -180 || lng > 180) {
      error = 'Longitude must be between -180 and 180 degrees';
      return;
    }

    loading = true;
    error = '';

    try {
      await updateTrack(trackId, name.trim(), lat, lng);
      push('/tracks');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleUseCurrentLocation = async () => {
    gettingLocation = true;
    error = '';

    try {
      const location = await getCurrentLocation();
      latitude = location.latitude.toString();
      longitude = location.longitude.toString();
    } catch (err) {
      error = err.message;
    } finally {
      gettingLocation = false;
    }
  };

  const handleCancel = () => {
    push('/tracks');
  };

  onMount(loadTrack);
</script>

<div class="edit-track">
  <div class="header">
    <h1>Edit Track</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if trackLoading}
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading track...</p>
    </div>
  {:else}
    <Card style="padding: 2rem;">
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <Textfield variant="outlined" bind:value={name} label="Track Name *" required disabled={loading} style="width: 100%;" />
        </div>

        <div class="location-section">
          <h3>Location Coordinates</h3>
          <div class="location-header">
            <p>Update the track's GPS coordinates or use your current location.</p>
            <Button
              type="button"
              on:click={handleUseCurrentLocation}
              disabled={gettingLocation || loading}
              variant="raised"
              style="background-color: #17a2b8;"
            >
              {#if gettingLocation}
                📍 Getting Location...
              {:else}
                📍 Use Current Location
              {/if}
            </Button>
          </div>

          <div class="coordinates-grid">
            <div class="form-group">
              <Textfield 
                variant="outlined" 
                type="number" 
                bind:value={latitude} 
                label="Latitude *" 
                required 
                disabled={loading || gettingLocation}
                input$step="any"
                input$min="-90"
                input$max="90"
                style="width: 100%;" 
              />
              <small class="hint">Range: -90 to 90 degrees</small>
            </div>

            <div class="form-group">
              <Textfield 
                variant="outlined" 
                type="number" 
                bind:value={longitude} 
                label="Longitude *" 
                required 
                disabled={loading || gettingLocation}
                input$step="any"
                input$min="-180"
                input$max="180"
                style="width: 100%;" 
              />
              <small class="hint">Range: -180 to 180 degrees</small>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="button"
            on:click={handleCancel}
            disabled={loading || gettingLocation}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || gettingLocation}
            variant="raised"
            style="background-color: #007bff;"
          >
            {#if loading}
              Updating Track...
            {:else}
              Update Track
            {/if}
          </Button>
        </div>
      </form>
    </Card>
  {/if}
</div>

<style>
  .edit-track {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header h1 {
    margin: 0 0 2rem 0;
    color: #333;
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

  .form-group {
    margin-bottom: 1.5rem;
  }

  .location-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }

  .location-section h3 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  .location-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .location-header p {
    margin: 0;
    color: #6c757d;
    flex: 1;
  }

  .coordinates-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .hint {
    display: block;
    margin-top: 0.25rem;
    color: #6c757d;
    font-size: 0.875rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
  }

  @media (max-width: 768px) {
    .edit-track {
      padding: 1rem;
    }

    .coordinates-grid {
      grid-template-columns: 1fr;
    }

    .location-header {
      flex-direction: column;
      align-items: stretch;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
