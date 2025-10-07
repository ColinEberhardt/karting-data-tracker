<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { updateSession, getUserSessions } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';

  export let params = {};
  let sessionId = params.id;

  // Session Information
  let date = '';
  let circuitId = '';
  let temp = '';
  let condition = 'Dry';
  let session = '';

  // Equipment Setup
  let tyreId = '';
  let engineId = '';

  // Kart Setup
  let rearSprocket = '';
  let frontSprocket = '';
  let caster = 'Half';
  let rideHeight = 'Middle';
  let jet = '';
  let rearInner = '';
  let rearOuter = '';
  let frontInner = '';
  let frontOuter = '';

  // Session Results
  let laps = '';
  let fastest = '';

  // Race Information (optional)
  let isRace = false;
  let entries = '';
  let startPos = '';
  let endPos = '';
  let penalties = '';
  let notes = '';

  let tyres = [];
  let tracks = [];
  let loading = false;
  let error = '';
  let initialLoading = true;

  const conditionOptions = ['Dry', 'Wet', 'Damp', 'Mixed'];
  const casterOptions = ['None', 'Quarter', 'Half', 'Three Quarter', 'Full'];
  const rideHeightOptions = ['Low', 'Middle', 'High'];

  const loadData = async () => {
    try {
      initialLoading = true;
      const [sessions, tyresData, tracksData] = await Promise.all([
        getUserSessions(),
        getUserTyres(),
        getUserTracks()
      ]);
      tyres = tyresData.filter(tyre => !tyre.retired);
      tracks = tracksData;

      // Find and load the existing session
      const sessionData = sessions.find(s => s.id === sessionId);
      if (!sessionData) {
        error = 'Session not found';
        return;
      }

      // Load existing data
      const sessionDate = sessionData.date ? (sessionData.date.toDate ? sessionData.date.toDate() : new Date(sessionData.date)) : new Date();
      const year = sessionDate.getFullYear();
      const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
      const day = String(sessionDate.getDate()).padStart(2, '0');
      date = `${year}-${month}-${day}`;
      
      circuitId = sessionData.circuitId || '';
      temp = sessionData.temp ? sessionData.temp.toString() : '';
      condition = sessionData.condition || 'Dry';
      session = sessionData.session || '';
      tyreId = sessionData.tyreId || '';
      engineId = sessionData.engineId || '';
      rearSprocket = sessionData.rearSprocket ? sessionData.rearSprocket.toString() : '';
      frontSprocket = sessionData.frontSprocket ? sessionData.frontSprocket.toString() : '';
      caster = sessionData.caster || 'Half';
      rideHeight = sessionData.rideHeight || 'Middle';
      jet = sessionData.jet ? sessionData.jet.toString() : '';
      rearInner = sessionData.rearInner ? sessionData.rearInner.toString() : '';
      rearOuter = sessionData.rearOuter ? sessionData.rearOuter.toString() : '';
      frontInner = sessionData.frontInner ? sessionData.frontInner.toString() : '';
      frontOuter = sessionData.frontOuter ? sessionData.frontOuter.toString() : '';
      laps = sessionData.laps ? sessionData.laps.toString() : '';
      fastest = sessionData.fastest ? sessionData.fastest.toString() : '';
      isRace = sessionData.isRace || false;
      entries = sessionData.entries ? sessionData.entries.toString() : '';
      startPos = sessionData.startPos ? sessionData.startPos.toString() : '';
      endPos = sessionData.endPos ? sessionData.endPos.toString() : '';
      penalties = sessionData.penalties || '';
      notes = sessionData.notes || '';
    } catch (err) {
      error = err.message;
    } finally {
      initialLoading = false;
    }
  };

  const setDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    date = `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!date || !circuitId || !session || !temp || !tyreId || !engineId || 
        !rearSprocket || !frontSprocket || !jet || !rearInner || !rearOuter || 
        !frontInner || !frontOuter || !laps) {
      error = 'Please fill in all required fields';
      return;
    }

    // Validate numeric fields
    const numericFields = [temp, rearSprocket, frontSprocket, jet, rearInner, rearOuter, frontInner, frontOuter, laps];
    if (numericFields.some(field => isNaN(Number(field)) || Number(field) <= 0)) {
      error = 'Please enter valid positive numbers for all numeric fields';
      return;
    }

    if (fastest && (isNaN(Number(fastest)) || Number(fastest) <= 0)) {
      error = 'Fastest lap time must be a valid positive number';
      return;
    }

    // Validate race fields if it's a race
    if (isRace) {
      if (!entries || !startPos || !endPos) {
        error = 'For race sessions, please enter entries, start position, and end position';
        return;
      }
      if ([entries, startPos, endPos].some(field => isNaN(Number(field)) || Number(field) <= 0)) {
        error = 'Race fields must be valid positive numbers';
        return;
      }
    }

    loading = true;
    error = '';

    try {
      const sessionData = {
        date,
        circuitId,
        temp,
        condition,
        session,
        tyreId,
        engineId,
        rearSprocket,
        frontSprocket,
        caster,
        rideHeight,
        jet,
        rearInner,
        rearOuter,
        frontInner,
        frontOuter,
        laps,
        fastest: fastest || null,
        isRace,
        entries: isRace ? entries : null,
        startPos: isRace ? startPos : null,
        endPos: isRace ? endPos : null,
        penalties: penalties || null,
        notes: notes || null
      };

      await updateSession(sessionId, sessionData);
      push('/sessions');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    loadData();
  });
</script>

<div class="new-session">
  <div class="header">
    <h1>Edit Karting Session</h1>
    <a href="/sessions" class="back-btn">← Back to Sessions</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if initialLoading}
    <div class="loading">Loading session data...</div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <!-- Session Information Section -->
      <div class="form-section">
        <h3>Session Information</h3>
        
        <div class="form-group">
          <label for="date">Date: *</label>
          <input
            type="date"
            id="date"
            bind:value={date}
            required
          />
        </div>

        <div class="form-group">
          <label for="circuitId">Circuit: *</label>
          <select id="circuitId" bind:value={circuitId} required>
            <option value="">Select a track...</option>
            {#each tracks as track (track.id)}
              <option value={track.id}>{track.name}</option>
            {/each}
          </select>
          {#if tracks.length === 0}
            <p class="no-items">
              No tracks found. <a href="/tracks/new">Add a track first</a>.
            </p>
          {/if}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="temp">Temperature (°C): *</label>
            <input
              type="number"
              id="temp"
              bind:value={temp}
              min="0"
              max="50"
              placeholder="e.g., 20"
              required
            />
          </div>

          <div class="form-group">
            <label for="condition">Track Condition: *</label>
            <select id="condition" bind:value={condition} required>
              {#each conditionOptions as conditionOption}
                <option value={conditionOption}>{conditionOption}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="session">Session Type: *</label>
          <input
            type="text"
            id="session"
            bind:value={session}
            placeholder="e.g., Practice, Qualifying, Heat 1"
            required
          />
        </div>
      </div>

      <!-- Equipment Setup Section -->
      <div class="form-section">
        <h3>Equipment Setup</h3>
        
        <div class="form-group">
          <label for="tyreId">Tyre Used: *</label>
          <select id="tyreId" bind:value={tyreId} required>
            <option value="">Select a tyre...</option>
            {#each tyres as tyre (tyre.id)}
              <option value={tyre.id}>{tyre.make} {tyre.type}</option>
            {/each}
          </select>
          {#if tyres.length === 0}
            <p class="no-items">
              No active tyres found. <a href="/tyres/new">Add a tyre first</a>.
            </p>
          {/if}
        </div>

        <div class="form-group">
          <label for="engineId">Engine ID: *</label>
          <input
            type="text"
            id="engineId"
            bind:value={engineId}
            placeholder="e.g., ENG001, Honda GX200"
            required
          />
        </div>
      </div>

      <!-- Kart Setup Section -->
      <div class="form-section">
        <h3>Kart Setup</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="rearSprocket">Rear Sprocket (teeth): *</label>
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
            <label for="frontSprocket">Front Sprocket (teeth): *</label>
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

        <div class="form-row">
          <div class="form-group">
            <label for="caster">Caster: *</label>
            <select id="caster" bind:value={caster} required>
              {#each casterOptions as casterOption}
                <option value={casterOption}>{casterOption}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="rideHeight">Ride Height: *</label>
            <select id="rideHeight" bind:value={rideHeight} required>
              {#each rideHeightOptions as heightOption}
                <option value={heightOption}>{heightOption}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="jet">Jet Size: *</label>
          <input
            type="number"
            id="jet"
            bind:value={jet}
            min="1"
            placeholder="e.g., 95"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="rearInner">Rear Inner Pressure (psi): *</label>
            <input
              type="number"
              id="rearInner"
              bind:value={rearInner}
              min="0"
              step="0.1"
              placeholder="e.g., 10.5"
              required
            />
          </div>

          <div class="form-group">
            <label for="rearOuter">Rear Outer Pressure (psi): *</label>
            <input
              type="number"
              id="rearOuter"
              bind:value={rearOuter}
              min="0"
              step="0.1"
              placeholder="e.g., 10.0"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="frontInner">Front Inner Pressure (psi): *</label>
            <input
              type="number"
              id="frontInner"
              bind:value={frontInner}
              min="0"
              step="0.1"
              placeholder="e.g., 12.0"
              required
            />
          </div>

          <div class="form-group">
            <label for="frontOuter">Front Outer Pressure (psi): *</label>
            <input
              type="number"
              id="frontOuter"
              bind:value={frontOuter}
              min="0"
              step="0.1"
              placeholder="e.g., 12.5"
              required
            />
          </div>
        </div>
      </div>

      <!-- Session Results Section -->
      <div class="form-section">
        <h3>Session Results</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="laps">Number of Laps: *</label>
            <input
              type="number"
              id="laps"
              bind:value={laps}
              min="1"
              placeholder="e.g., 15"
              required
            />
          </div>

          <div class="form-group">
            <label for="fastest">Fastest Lap Time (seconds):</label>
            <input
              type="number"
              id="fastest"
              bind:value={fastest}
              min="0"
              step="0.001"
              placeholder="e.g., 58.234"
            />
          </div>
        </div>
      </div>

      <!-- Race Information Section -->
      <div class="form-section">
        <h3>Race Information (Optional)</h3>
        
        <div class="form-group checkbox-group">
          <label for="isRace" class="checkbox-label">
            <input
              type="checkbox"
              id="isRace"
              bind:checked={isRace}
            />
            This was a race session
          </label>
        </div>

        {#if isRace}
          <div class="race-fields">
            <div class="form-row">
              <div class="form-group">
                <label for="entries">Number of Entries:</label>
                <input
                  type="number"
                  id="entries"
                  bind:value={entries}
                  min="1"
                  placeholder="e.g., 24"
                />
              </div>

              <div class="form-group">
                <label for="startPos">Starting Position:</label>
                <input
                  type="number"
                  id="startPos"
                  bind:value={startPos}
                  min="1"
                  placeholder="e.g., 8"
                />
              </div>

              <div class="form-group">
                <label for="endPos">Finishing Position:</label>
                <input
                  type="number"
                  id="endPos"
                  bind:value={endPos}
                  min="1"
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="penalties">Penalties:</label>
              <input
                type="text"
                id="penalties"
                bind:value={penalties}
                placeholder="e.g., +5 seconds for track limits"
              />
            </div>
          </div>
        {/if}

        <div class="form-group">
          <label for="notes">Session Notes:</label>
          <textarea
            id="notes"
            bind:value={notes}
            rows="4"
            placeholder="Additional notes about setup, conditions, incidents, etc."
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" on:click={() => push('/sessions')} class="cancel-btn">
          Cancel
        </button>
        <button type="submit" disabled={loading || tyres.length === 0 || tracks.length === 0} class="submit-btn">
          {loading ? 'Updating...' : 'Update Session'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .new-session {
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

  .loading {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.1rem;
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

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    cursor: pointer;
  }

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .no-items {
    margin-top: 0.5rem;
    color: #dc3545;
    font-size: 0.9rem;
  }

  .no-items a {
    color: #007bff;
    text-decoration: none;
  }

  .no-items a:hover {
    text-decoration: underline;
  }

  .checkbox-group {
    margin-bottom: 1rem;
  }

  .race-fields {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
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

    .form-section h3 {
      font-size: 1.1rem;
    }
  }
</style>
