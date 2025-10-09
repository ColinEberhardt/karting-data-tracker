<script>
  import { onMount } from 'svelte';
  import { push, link } from 'svelte-spa-router';
  import { addSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';
  import Card from '@smui/card';
  import Textfield from '@smui/textfield';
  import Select, { Option } from '@smui/select';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Button from '@smui/button';

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
  let engines = [];
  let loading = false;
  let error = '';

  const conditionOptions = ['Dry', 'Wet', 'Damp', 'Mixed'];
  const casterOptions = ['None', 'Quarter', 'Half', 'Three Quarter', 'Full'];
  const rideHeightOptions = ['Low', 'Middle', 'High'];

  const loadData = async () => {
    try {
      const [tyresData, tracksData, enginesData] = await Promise.all([
        getUserTyres(),
        getUserTracks(),
        getUserEngines()
      ]);
      tyres = tyresData.filter(tyre => !tyre.retired);
      tracks = tracksData;
      engines = enginesData.filter(engine => !engine.retired);
    } catch (err) {
      error = err.message;
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

      await addSession(sessionData);
      push('/sessions');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    setDefaultDate();
    loadData();
  });
</script>

<div class="new-session">
  <div class="header">
    <h1>Add New Karting Session</h1>
    <a href="/sessions" use:link class="back-btn">← Back to Sessions</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <Card style="padding: 2rem;">
    <form on:submit|preventDefault={handleSubmit}>
      <!-- Session Information Section -->
      <div class="form-section">
      <h3>Session Information</h3>
      
      <div class="form-group">
        <Textfield variant="outlined" type="date" bind:value={date} label="Date *" required style="width: 100%;" />
      </div>

      <div class="form-group">
        <Select variant="outlined" bind:value={circuitId} label="Circuit *" required style="width: 100%;">
          <Option value="">Select a track...</Option>
          {#each tracks as track (track.id)}
            <Option value={track.id}>{track.name}</Option>
          {/each}
        </Select>
        {#if tracks.length === 0}
          <p class="no-items">
            No tracks found. <a href="/tracks/new">Add a track first</a>.
          </p>
        {/if}
      </div>

      <div class="form-row">
        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={temp} label="Temperature (°C) *" required input$min="0" input$max="50" style="width: 100%;" />
        </div>

        <div class="form-group">
          <Select variant="outlined" bind:value={condition} label="Track Condition *" required style="width: 100%;">
            {#each conditionOptions as conditionOption}
              <Option value={conditionOption}>{conditionOption}</Option>
            {/each}
          </Select>
        </div>
      </div>

      <div class="form-group">
        <Textfield variant="outlined" bind:value={session} label="Session Type *" required style="width: 100%;" />
      </div>
    </div>

    <!-- Equipment Setup Section -->
    <div class="form-section">
      <h3>Equipment Setup</h3>
      
      <div class="form-group">
        <Select variant="outlined" bind:value={tyreId} label="Tyre Used *" required style="width: 100%;">
          <Option value="">Select a tyre...</Option>
          {#each tyres as tyre (tyre.id)}
            <Option value={tyre.id}>{tyre.name || `${tyre.make} ${tyre.type}`}</Option>
          {/each}
        </Select>
        {#if tyres.length === 0}
          <p class="no-items">
            No active tyres found. <a href="/tyres/new">Add a tyre first</a>.
          </p>
        {/if}
      </div>

      <div class="form-group">
        <Select variant="outlined" bind:value={engineId} label="Engine *" required style="width: 100%;">
          <Option value="">Select an engine...</Option>
          {#each engines as engine (engine.id)}
            <Option value={engine.id}>{engine.name || `${engine.make} ${engine.model}`}</Option>
          {/each}
        </Select>
        {#if engines.length === 0}
          <p class="no-items">
            No active engines found. <a href="/engines/new">Add an engine first</a>.
          </p>
        {/if}
      </div>
    </div>

    <!-- Kart Setup Section -->
    <div class="form-section">
      <h3>Kart Setup</h3>
      
      <div class="form-row">
        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={rearSprocket} label="Rear Sprocket (teeth) *" required input$min="1" style="width: 100%;" />
        </div>

        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={frontSprocket} label="Front Sprocket (teeth) *" required input$min="1" style="width: 100%;" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <Select variant="outlined" bind:value={caster} label="Caster *" required style="width: 100%;">
            {#each casterOptions as casterOption}
              <Option value={casterOption}>{casterOption}</Option>
            {/each}
          </Select>
        </div>

        <div class="form-group">
          <Select variant="outlined" bind:value={rideHeight} label="Ride Height *" required style="width: 100%;">
            {#each rideHeightOptions as heightOption}
              <Option value={heightOption}>{heightOption}</Option>
            {/each}
          </Select>
        </div>
      </div>

      <div class="form-group">
        <Textfield variant="outlined" type="number" bind:value={jet} label="Jet Size *" required input$min="1" style="width: 100%;" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={rearInner} label="Rear Inner Pressure (psi) *" required input$min="0" input$step="0.1" style="width: 100%;" />
        </div>

        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={rearOuter} label="Rear Outer Pressure (psi) *" required input$min="0" input$step="0.1" style="width: 100%;" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={frontInner} label="Front Inner Pressure (psi) *" required input$min="0" input$step="0.1" style="width: 100%;" />
        </div>

        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={frontOuter} label="Front Outer Pressure (psi) *" required input$min="0" input$step="0.1" style="width: 100%;" />
        </div>
      </div>
    </div>

    <!-- Session Results Section -->
    <div class="form-section">
      <h3>Session Results</h3>
      
      <div class="form-row">
        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={laps} label="Number of Laps *" required input$min="1" style="width: 100%;" />
        </div>

        <div class="form-group">
          <Textfield variant="outlined" type="number" bind:value={fastest} label="Fastest Lap Time (seconds)" input$min="0" input$step="0.001" style="width: 100%;" />
        </div>
      </div>
    </div>

    <!-- Race Information Section -->
    <div class="form-section">
      <h3>Race Information (Optional)</h3>
      
      <div class="form-group checkbox-group">
        <FormField>
          <Checkbox bind:checked={isRace} />
          <span slot="label">This was a race session</span>
        </FormField>
      </div>

      {#if isRace}
        <div class="race-fields">
          <div class="form-row">
            <div class="form-group">
              <Textfield variant="outlined" type="number" bind:value={entries} label="Number of Entries" input$min="1" style="width: 100%;" />
            </div>

            <div class="form-group">
              <Textfield variant="outlined" type="number" bind:value={startPos} label="Starting Position" input$min="1" style="width: 100%;" />
            </div>

            <div class="form-group">
              <Textfield variant="outlined" type="number" bind:value={endPos} label="Finishing Position" input$min="1" style="width: 100%;" />
            </div>
          </div>

          <div class="form-group">
            <Textfield variant="outlined" bind:value={penalties} label="Penalties" style="width: 100%;" />
          </div>
        </div>
      {/if}

      <div class="form-group">
        <Textfield variant="outlined" bind:value={notes} label="Session Notes" textarea style="width: 100%;" input$rows={4} />
      </div>
    </div>

    <div class="form-actions">
      <Button type="button" onclick={() => push('/sessions')} variant="outlined">
        Cancel
      </Button>
      <Button type="submit" disabled={loading || tyres.length === 0 || tracks.length === 0 || engines.length === 0} variant="raised" style="background-color: #007bff;">
        {loading ? 'Adding...' : 'Add Session'}
      </Button>
    </div>
  </form>
  </Card>
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
