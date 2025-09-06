<script>
  import { push } from 'svelte-spa-router';
  import { addTrack, getCurrentLocation } from '../lib/tracks.js';

  let name = '';
  let latitude = '';
  let longitude = '';
  let loading = false;
  let error = '';
  let gettingLocation = false;

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
      await addTrack(name.trim(), lat, lng);
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
</script>

<div class="new-track">
  <div class="header">
    <h1>Add New Track</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="track-form">
    <div class="form-group">
      <label for="name">Track Name: *</label>
      <input
        type="text"
        id="name"
        bind:value={name}
        placeholder="e.g., Silverstone, Monaco, Brands Hatch"
        required
        disabled={loading}
      />
    </div>

    <div class="location-section">
      <h3>Location Coordinates</h3>
      <div class="location-header">
        <p>Enter the track's GPS coordinates or use your current location.</p>
        <button
          type="button"
          on:click={handleUseCurrentLocation}
          disabled={gettingLocation || loading}
          class="location-btn"
        >
          {#if gettingLocation}
            📍 Getting Location...
          {:else}
            📍 Use Current Location
          {/if}
        </button>
      </div>

      <div class="coordinates-grid">
        <div class="form-group">
          <label for="latitude">Latitude: *</label>
          <input
            type="number"
            id="latitude"
            bind:value={latitude}
            placeholder="e.g., 52.0786"
            step="any"
            min="-90"
            max="90"
            required
            disabled={loading || gettingLocation}
          />
          <small class="hint">Range: -90 to 90 degrees</small>
        </div>

        <div class="form-group">
          <label for="longitude">Longitude: *</label>
          <input
            type="number"
            id="longitude"
            bind:value={longitude}
            placeholder="e.g., -1.0169"
            step="any"
            min="-180"
            max="180"
            required
            disabled={loading || gettingLocation}
          />
          <small class="hint">Range: -180 to 180 degrees</small>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        on:click={handleCancel}
        disabled={loading || gettingLocation}
        class="cancel-btn"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || gettingLocation}
        class="submit-btn"
      >
        {#if loading}
          Adding Track...
        {:else}
          Add Track
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .new-track {
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

  .track-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-group input:disabled {
    background-color: #e9ecef;
    opacity: 0.6;
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

  .location-btn {
    background-color: #17a2b8;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  .location-btn:hover:not(:disabled) {
    background-color: #138496;
  }

  .location-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
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

  .cancel-btn {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #5a6268;
  }

  .submit-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .cancel-btn:disabled,
  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .new-track {
      padding: 1rem;
    }

    .track-form {
      padding: 1.5rem;
    }

    .coordinates-grid {
      grid-template-columns: 1fr;
    }

    .location-header {
      flex-direction: column;
      align-items: stretch;
    }

    .location-btn {
      align-self: center;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
