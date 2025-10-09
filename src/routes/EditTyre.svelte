<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../lib/firebase.js';
  import { updateTyre } from '../lib/tyres.js';

  export let params = {};

  let name = '';
  let make = '';
  let type = '';
  let description = '';
  let retired = false;
  let loading = false;
  let error = '';
  let tyreId = '';

  const loadTyre = async () => {
    tyreId = params.id;
    if (!tyreId) {
      error = 'Tyre ID not provided';
      return;
    }

    try {
      loading = true;
      const tyreRef = doc(db, 'tyres', tyreId);
      const tyreSnap = await getDoc(tyreRef);
      
      if (tyreSnap.exists()) {
        const tyreData = tyreSnap.data();
        name = tyreData.name || '';
        make = tyreData.make || tyreData.brand || ''; // Handle legacy brand field
        type = tyreData.type || '';
        description = tyreData.description || '';
        retired = tyreData.retired || false;
      } else {
        error = 'Tyre not found';
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !make.trim() || !type.trim()) {
      error = 'Please fill in all required fields (Name, Make and Type)';
      return;
    }

    loading = true;
    error = '';

    try {
      await updateTyre(tyreId, name.trim(), make.trim(), type.trim(), description.trim(), retired);
      push('/tyres');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    push('/tyres');
  };

  onMount(loadTyre);
</script>

<div class="edit-tyre">
  <div class="header">
    <h1>Edit Tyre</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading tyre details...</div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="tyre-form">
      <div class="form-group">
        <label for="name">Name: *</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          placeholder="e.g., Front Race Set, Wet Weather Tyres"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="make">Make: *</label>
        <input
          type="text"
          id="make"
          bind:value={make}
          placeholder="e.g., Mojo, Maxxi"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="type">Type: *</label>
        <select
          id="type"
          bind:value={type}
          required
          disabled={loading}
        >
          <option value="">Select type</option>
          <option value="Dry">Dry</option>
          <option value="Wet">Wet</option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          bind:value={description}
          placeholder="e.g., Used on wet track at Rowrah, Front tyres from last race"
          rows="4"
          disabled={loading}
        ></textarea>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={retired}
            disabled={loading}
          />
          Retired
        </label>
      </div>

      <div class="form-actions">
        <button type="button" on:click={handleCancel} class="cancel-btn" disabled={loading}>
          Cancel
        </button>
        <button type="submit" class="submit-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Tyre'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .edit-tyre {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    color: #495057;
    margin: 0;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
    font-size: 1.1rem;
  }

  .tyre-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #dee2e6;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #495057;
    font-weight: 500;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  input:disabled, textarea:disabled, select:disabled {
    background-color: #f8f9fa;
    opacity: 0.6;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .cancel-btn, .submit-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 500;
  }

  .cancel-btn {
    background-color: #6c757d;
    color: white;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #545b62;
  }

  .submit-btn {
    background-color: #007bff;
    color: white;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .cancel-btn:disabled, .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }

  @media (max-width: 768px) {
    .edit-tyre {
      padding: 1rem;
    }

    .tyre-form {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn, .submit-btn {
      width: 100%;
    }
  }
</style>
