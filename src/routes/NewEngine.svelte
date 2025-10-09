<script>
  import { createEventDispatcher } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { addEngine } from '../lib/engines.js';
  import Card from '@smui/card';
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';

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

  <Card style="padding: 2rem;">
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-section">
        <h3>Engine Information</h3>
        
        <div class="form-row">
          <div class="form-group">
            <Textfield variant="outlined" bind:value={name} label="Name *" required style="width: 100%;" />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <Textfield variant="outlined" bind:value={make} label="Make *" required style="width: 100%;" />
          </div>

          <div class="form-group">
            <Textfield variant="outlined" bind:value={model} label="Model *" required style="width: 100%;" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <Textfield variant="outlined" bind:value={serialNumber} label="Serial Number" style="width: 100%;" />
          </div>

          <div class="form-group">
            <Textfield variant="outlined" bind:value={sealNumber} label="Seal Number" style="width: 100%;" />
          </div>
        </div>

        <div class="form-group">
          <Textfield variant="outlined" type="date" bind:value={purchaseDate} label="Purchase Date" style="width: 100%;" />
          <Button type="button" onclick={setDefaultDate} variant="outlined" style="position: absolute; right: 10px; top: 35px; min-width: auto; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
            Set to Today
          </Button>
        </div>

        <div class="form-group">
          <Textfield variant="outlined" bind:value={notes} label="Notes" textarea style="width: 100%;" input$rows={4} />
        </div>
      </div>

      <div class="form-actions">
        <Button type="button" onclick={() => push('/engines')} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} variant="raised" style="background-color: #007bff;">
          {loading ? 'Adding...' : 'Add Engine'}
        </Button>
      </div>
    </form>
  </Card>
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

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
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
  }
</style>
