<script>
  import { createEventDispatcher } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { addEngine } from '../lib/engines.js';

  let name = '';
  let make = '';
  let model = '';
  let serialNumber = '';
  let sealNumber = '';
  let purchaseDate = '';
  let notes = '';
  let loading = false;
  let error = '';

  const setDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    purchaseDate = `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!name || !make || !model) {
      error = 'Name, make and model are required';
      return;
    }

    loading = true;
    error = '';

    try {
      const engineData = {
        name: name.trim(),
        make: make.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim() || null,
        sealNumber: sealNumber.trim() || null,
        purchaseDate: purchaseDate || null,
        notes: notes.trim() || null
      };

      await addEngine(engineData);
      push('/engines');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };
</script>

<div class="new-engine">
  <div class="header">
    <h1>Add New Engine</h1>
    <a href="/engines" use:link class="back-btn">← Back to Engines</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-section">
      <h3>Engine Information</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="name">Name: *</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="e.g., My Race Engine, Backup Motor"
            required
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="make">Make: *</label>
          <input
            type="text"
            id="make"
            bind:value={make}
            placeholder="e.g., Honda, Briggs & Stratton"
            required
          />
        </div>

        <div class="form-group">
          <label for="model">Model: *</label>
          <input
            type="text"
            id="model"
            bind:value={model}
            placeholder="e.g., GX200, LO206"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="serialNumber">Serial Number:</label>
          <input
            type="text"
            id="serialNumber"
            bind:value={serialNumber}
            placeholder="Engine serial number"
          />
        </div>

        <div class="form-group">
          <label for="sealNumber">Seal Number:</label>
          <input
            type="text"
            id="sealNumber"
            bind:value={sealNumber}
            placeholder="Engine seal number"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="purchaseDate">Purchase Date:</label>
        <input
          type="date"
          id="purchaseDate"
          bind:value={purchaseDate}
        />
        <button type="button" on:click={setDefaultDate} class="today-btn">
          Set to Today
        </button>
      </div>

      <div class="form-group">
        <label for="notes">Notes:</label>
        <textarea
          id="notes"
          bind:value={notes}
          rows="4"
          placeholder="Additional notes about the engine, modifications, maintenance history, etc."
        ></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" on:click={() => push('/engines')} class="cancel-btn">
        Cancel
      </button>
      <button type="submit" disabled={loading} class="submit-btn">
        {loading ? 'Adding...' : 'Add Engine'}
      </button>
    </div>
  </form>
</div>

<style>
  .new-engine {
    max-width: 800px;
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

  .back-btn {
    color: #007bff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .back-btn:hover {
    background-color: #f8f9fa;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid #f5c6cb;
    margin-bottom: 1rem;
  }

  form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
  }

  .form-section {
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e9ecef;
  }

  .form-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .form-section h3 {
    margin: 0 0 1.5rem 0;
    color: #495057;
    font-size: 1.25rem;
    font-weight: 600;
    border-left: 4px solid #007bff;
    padding-left: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .today-btn {
    position: absolute;
    right: 10px;
    top: 35px;
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .today-btn:hover {
    background: #5a6268;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
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

  .cancel-btn:hover {
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

  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .new-engine {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-section h3 {
      font-size: 1.1rem;
    }
  }
</style>