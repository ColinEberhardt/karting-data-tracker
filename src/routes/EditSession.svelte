<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { updateSession, getUserSessions } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';

  export let params = {};
  
  let sessionId = params.id;
  let dateTime = '';
  let rearSprocket = '';
  let frontSprocket = '';
  let tyreId = '';
  let tyres = [];
  let loading = false;
  let error = '';
  let initialLoading = true;

  const loadData = async () => {
    try {
      initialLoading = true;
      const [sessions, allTyres] = await Promise.all([
        getUserSessions(),
        getUserTyres()
      ]);
      
      tyres = allTyres.filter(tyre => !tyre.retired);
      
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        error = 'Session not found';
        return;
      }

      // Convert Firestore timestamp to datetime-local format
      const sessionDate = session.dateTime.toDate ? session.dateTime.toDate() : new Date(session.dateTime);
      const year = sessionDate.getFullYear();
      const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
      const day = String(sessionDate.getDate()).padStart(2, '0');
      const hours = String(sessionDate.getHours()).padStart(2, '0');
      const minutes = String(sessionDate.getMinutes()).padStart(2, '0');
      dateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      rearSprocket = session.rearSprocket.toString();
      frontSprocket = session.frontSprocket.toString();
      tyreId = session.tyreId;
    } catch (err) {
      error = err.message;
    } finally {
      initialLoading = false;
    }
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
      await updateSession(sessionId, dateTime, rearSprocket, frontSprocket, tyreId);
      push('/sessions');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(loadData);
</script>

<div class="edit-session">
  <div class="header">
    <h1>Edit Karting Session</h1>
    <a href="/sessions" class="back-btn">← Back to Sessions</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if initialLoading}
    <div class="loading">Loading session...</div>
  {:else}
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
          {loading ? 'Updating...' : 'Update Session'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .edit-session {
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

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
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
    .edit-session {
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
