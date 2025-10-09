<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { getSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';

  export let params = {};
  
  let session = null;
  let tyres = [];
  let tracks = [];
  let engines = [];
  let loading = true;
  let error = '';

  const loadData = async () => {
    try {
      loading = true;
      const [sessionData, tyresData, tracksData, enginesData] = await Promise.all([
        getSession(params.id),
        getUserTyres(),
        getUserTracks(),
        getUserEngines()
      ]);
      
      session = sessionData;
      tyres = tyresData;
      tracks = tracksData;
      engines = enginesData;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const formatFastestLap = (time) => {
    if (!time) return 'Not recorded';
    return `${time.toFixed(3)} seconds`;
  };

  const getTrackName = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : 'Unknown Track';
  };

  const getTyreName = (tyreId) => {
    const tyre = tyres.find(t => t.id === tyreId);
    return tyre ? (tyre.name || `${tyre.make} ${tyre.type}`) : 'Unknown Tyre';
  };

  const getEngineName = (engineId) => {
    const engine = engines.find(e => e.id === engineId);
    return engine ? (engine.name || `${engine.make} ${engine.model}`) : 'Unknown Engine';
  };

  onMount(loadData);
</script>

<div class="view-session">
  <div class="header">
    <h1>Session Details</h1>
    <div class="header-actions">
      <a href="/sessions" use:link class="back-btn">← Back to Sessions</a>
      {#if session}
        <a href="/sessions/edit/{session.id}" use:link class="edit-btn">Edit Session</a>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading session details...</div>
  {:else if session}
    <div class="session-content">
      <!-- Session Information Section -->
      <div class="detail-section">
        <h3>Session Information</h3>
        
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Date:</span>
            <span class="value">{formatDate(session.date)}</span>
          </div>

          <div class="detail-item">
            <span class="label">Circuit:</span>
            <span class="value">{getTrackName(session.circuitId)}</span>
          </div>

          <div class="detail-item">
            <span class="label">Temperature:</span>
            <span class="value">{session.temp}°C</span>
          </div>

          <div class="detail-item">
            <span class="label">Track Condition:</span>
            <span class="value">{session.condition}</span>
          </div>

          <div class="detail-item">
            <span class="label">Session Type:</span>
            <span class="value">{session.session}</span>
          </div>
        </div>
      </div>

      <!-- Equipment Setup Section -->
      <div class="detail-section">
        <h3>Equipment Setup</h3>
        
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Tyre Used:</span>
            <span class="value">{getTyreName(session.tyreId)}</span>
          </div>

          <div class="detail-item">
            <span class="label">Engine:</span>
            <span class="value">{getEngineName(session.engineId)}</span>
          </div>
        </div>
      </div>

      <!-- Kart Setup Section -->
      <div class="detail-section">
        <h3>Kart Setup</h3>
        
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Rear Sprocket:</span>
            <span class="value">{session.rearSprocket} teeth</span>
          </div>

          <div class="detail-item">
            <span class="label">Front Sprocket:</span>
            <span class="value">{session.frontSprocket} teeth</span>
          </div>

          <div class="detail-item">
            <span class="label">Caster:</span>
            <span class="value">{session.caster}</span>
          </div>

          <div class="detail-item">
            <span class="label">Ride Height:</span>
            <span class="value">{session.rideHeight}</span>
          </div>

          <div class="detail-item">
            <span class="label">Jet Size:</span>
            <span class="value">{session.jet}</span>
          </div>

          <div class="detail-item">
            <span class="label">Rear Inner Pressure:</span>
            <span class="value">{session.rearInner} psi</span>
          </div>

          <div class="detail-item">
            <span class="label">Rear Outer Pressure:</span>
            <span class="value">{session.rearOuter} psi</span>
          </div>

          <div class="detail-item">
            <span class="label">Front Inner Pressure:</span>
            <span class="value">{session.frontInner} psi</span>
          </div>

          <div class="detail-item">
            <span class="label">Front Outer Pressure:</span>
            <span class="value">{session.frontOuter} psi</span>
          </div>
        </div>
      </div>

      <!-- Session Results Section -->
      <div class="detail-section">
        <h3>Session Results</h3>
        
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Number of Laps:</span>
            <span class="value">{session.laps}</span>
          </div>

          <div class="detail-item">
            <span class="label">Fastest Lap Time:</span>
            <span class="value">{formatFastestLap(session.fastest)}</span>
          </div>
        </div>
      </div>

      <!-- Race Information Section -->
      {#if session.isRace}
        <div class="detail-section">
          <h3>Race Information</h3>
          
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Number of Entries:</span>
              <span class="value">{session.entries || 'Not recorded'}</span>
            </div>

            <div class="detail-item">
              <span class="label">Starting Position:</span>
              <span class="value">{session.startPos || 'Not recorded'}</span>
            </div>

            <div class="detail-item">
              <span class="label">Finishing Position:</span>
              <span class="value">{session.endPos || 'Not recorded'}</span>
            </div>

            {#if session.penalties}
              <div class="detail-item full-width">
                <span class="label">Penalties:</span>
                <span class="value">{session.penalties}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Session Notes Section -->
      {#if session.notes}
        <div class="detail-section">
          <h3>Session Notes</h3>
          
          <div class="notes-content">
            <p>{session.notes}</p>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <h2>Session Not Found</h2>
      <p>The session you're looking for doesn't exist or you don't have access to it.</p>
      <a href="/sessions" use:link class="back-btn">Back to Sessions</a>
    </div>
  {/if}
</div>

<style>
  .view-session {
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

  .header-actions {
    display: flex;
    gap: 1rem;
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

  .edit-btn {
    background-color: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .edit-btn:hover {
    background-color: #218838;
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

  .empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f8f9fa;
    border-radius: 10px;
    margin-top: 2rem;
  }

  .empty-state h2 {
    color: #666;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #888;
    margin-bottom: 2rem;
  }

  .session-content {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    overflow: hidden;
  }

  .detail-section {
    padding: 2rem;
    border-bottom: 1px solid #e9ecef;
  }

  .detail-section:last-child {
    border-bottom: none;
  }

  .detail-section h3 {
    margin: 0 0 1.5rem 0;
    color: #495057;
    font-size: 1.25rem;
    font-weight: 600;
    border-left: 4px solid #007bff;
    padding-left: 1rem;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .detail-item.full-width {
    grid-column: 1 / -1;
  }

  .label {
    font-weight: 500;
    color: #666;
  }

  .value {
    color: #333;
    font-weight: 600;
  }

  .notes-content {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #007bff;
  }

  .notes-content p {
    margin: 0;
    color: #333;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .view-session {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-actions {
      justify-content: space-between;
    }

    .detail-section {
      padding: 1.5rem;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .detail-section h3 {
      font-size: 1.1rem;
    }
  }
</style>