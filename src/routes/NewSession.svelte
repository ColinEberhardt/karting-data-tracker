<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { addSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';

  let dateTime = '';
  let rearSprocket = '';
  let frontSprocket = '';
  let tyreId = '';
  let tyres = [];
  let loading = false;
  let error = '';

  const loadTyres = async () => {
    try {
      tyres = await getUserTyres();
      // Filter out retired tyres
      tyres = tyres.filter(tyre => !tyre.retired);
    } catch (err) {
      error = err.message;
    }
  };

  const setDefaultDateTime = () => {
    const now = new Date();
    // Format for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async () => {
    if (!dateTime || !rearSprocket || !frontSprocket || !tyreId) {
      error = 'Please fill in all fields';
      return;
    }

    if (isNaN(Number(rearSprocket)) || isNaN(Number(frontSprocket))) {
      error = 'Sprocket values must be numbers';
      return;
    }

    if (parseInt(rearSprocket) <= 0 || parseInt(frontSprocket) <= 0) {
      error = 'Sprocket values must be positive numbers';
      return;
    }

    try {
      loading = true;
      error = '';
      await addSession(dateTime, rearSprocket, frontSprocket, tyreId);
      push('/sessions');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    setDefaultDateTime();
    loadTyres();
  });
</script>

<div class="new-session">
  <div class="header">
    <h1>Add New Karting Session</h1>
    <a href="/sessions" class="back-btn">← Back to Sessions</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="dateTime">Date & Time:</label>
      <input
        type="datetime-local"
        id="dateTime"
        bind:value={dateTime}
        required
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="rearSprocket">Rear Sprocket (teeth):</label>
        <input
          type="number"
          id="rearSprocket"
          bind:value={rearSprocket}
          min="1"
          placeholder="e.g., 72"
          required
        />
      </div>

      <div class="form-group">
        <label for="frontSprocket">Front Sprocket (teeth):</label>
        <input
          type="number"
          id="frontSprocket"
          bind:value={frontSprocket}
          min="1"
          placeholder="e.g., 12"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label for="tyreId">Tyre Used:</label>
      <select id="tyreId" bind:value={tyreId} required>
        <option value="">Select a tyre...</option>
        {#each tyres as tyre (tyre.id)}
          <option value={tyre.id}>{tyre.make} {tyre.type}</option>
        {/each}
      </select>
      {#if tyres.length === 0}
        <p class="no-tyres">
          No active tyres found. <a href="/tyres/new">Add a tyre first</a>.
        </p>
      {/if}
    </div>

    <div class="form-actions">
      <button type="button" on:click={() => push('/sessions')} class="cancel-btn">
        Cancel
      </button>
      <button type="submit" disabled={loading || tyres.length === 0} class="submit-btn">
        {loading ? 'Adding...' : 'Add Session'}
      </button>
    </div>
  </form>
</div>

<style>
  .new-session {
    max-width: 600px;
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

  .form-group {
    margin-bottom: 1.5rem;
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

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .no-tyres {
    margin-top: 0.5rem;
    color: #dc3545;
    font-size: 0.9rem;
  }

  .no-tyres a {
    color: #007bff;
    text-decoration: none;
  }

  .no-tyres a:hover {
    text-decoration: underline;
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
    .new-session {
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
