<script>
  import { onMount } from 'svelte';
  import { link, push } from 'svelte-spa-router';
  import { getUserSessions, deleteSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import './sessions.css';

  let sessions = [];
  let tyres = [];
  let tracks = [];
  let engines = [];
  let loading = true;
  let error = '';
  let sortBy = 'date';
  let sortDirection = 'desc';
  let viewMode = 'compact';

  const loadData = async () => {
    try {
      loading = true;
      [sessions, tyres, tracks, engines] = await Promise.all([
        getUserSessions(),
        getUserTyres(),
        getUserTracks(),
        getUserEngines()
      ]);
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
    if (!time) return '-';
    return `${time.toFixed(2)}`;
  };

  const formatTime = (time) => {
    if (!time) return '-';
    const date = time.toDate ? time.toDate() : new Date(time);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
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

  const handleRowClick = (sessionId) => {
    push(`/sessions/view/${sessionId}`);
  };

  const getAvgTyrePressure = (session) => {
    const pressures = [session.frontInner, session.frontOuter, session.rearInner, session.rearOuter].filter(p => p != null && !isNaN(p));
    if (pressures.length === 0) return null;
    return pressures.reduce((a, b) => a + b, 0) / pressures.length;
  };

  const getGearRatio = (session) => {
    if (!session.frontSprocket || !session.rearSprocket) return null;
    return session.rearSprocket / session.frontSprocket;
  };

  const formatTyrePressure = (session) => {
    const fi = session.frontInner;
    const fo = session.frontOuter;
    const ri = session.rearInner;
    const ro = session.rearOuter;
    
    if ([fi, fo, ri, ro].some(p => p == null || isNaN(p))) return '-';
    
    if (fi === fo && fo === ri && ri === ro) {
      return `${fi.toFixed(1)} PSI`;
    }
    
    if (fi === fo && ri === ro && fi !== ri) {
      return `F: ${fi.toFixed(1)} / R: ${ri.toFixed(1)}`;
    }
    
    return `FI: ${fi.toFixed(1)} / FO: ${fo.toFixed(1)} / RI: ${ri.toFixed(1)} / RO: ${ro.toFixed(1)}`;
  };

  const formatGearRatio = (session) => {
    const ratio = getGearRatio(session);
    if (!ratio) return '-';
    return `${session.frontSprocket}/${session.rearSprocket} (${ratio.toFixed(2)})`;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortDirection = 'desc';
    }
  };

  const sortSessions = (sessions) => {
    const sorted = [...sessions].sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'date') {
        aVal = a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
        bVal = b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
      } else if (sortBy === 'tyrePressure') {
        aVal = getAvgTyrePressure(a) || 0;
        bVal = getAvgTyrePressure(b) || 0;
      } else if (sortBy === 'gearRatio') {
        aVal = getGearRatio(a) || 0;
        bVal = getGearRatio(b) || 0;
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return sorted;
  };

  $: sortedSessions = sessions.length > 0 ? sortSessions(sessions) : [];

  onMount(loadData);

  const getWeatherDescription = (session) => {
    const t = session.temp;
    const c = session.condition;
    const hasTemp = t !== undefined && t !== null && t !== '';
    const hasCond = !!c;
    if (hasTemp && hasCond) return `${t}°C, ${c}`;
    if (hasTemp) return `${t}°C`;
    if (hasCond) return c;
    return '-';
  };
</script>

<div class="sessions-dashboard">
  <div class="page-header">
    <h1>Sessions</h1>
    <Button href="/sessions/new" tag="a" use={[link]} variant="raised" color="primary">+ Add New Session</Button>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading sessions...</p>
    </div>
  {:else if sessions.length === 0}
    <div class="empty-state">
      <h2>No Sessions Yet</h2>
      <p>Start tracking your karting sessions!</p>
      <Button href="/sessions/new" tag="a" use={[link]} variant="raised" color="primary">Add Your First Session</Button>
    </div>
  {:else}
    <div class="controls">
      <div class="control-group">
        <label for="sort-by">Sort by:</label>
        <select id="sort-by" bind:value={sortBy} on:change={() => sortDirection = 'desc'}>
          <option value="date">Date</option>
          <option value="tyrePressure">Tyre Pressure (Avg)</option>
          <option value="gearRatio">Gear Ratio</option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="view-mode">View:</label>
        <select id="view-mode" bind:value={viewMode}>
          <option value="compact">Compact</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <DataTable class="sessions-table" style="width: 100%;">
        <Head>
          <Row>
            <Cell class="col-date sortable" on:click={() => handleSort('date')}>
              Date {sortBy === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </Cell>
            <Cell class="col-track">Track</Cell>
            <Cell class="col-session">Session</Cell>
            <Cell class="col-weather">Weather</Cell>
            <Cell class="col-tyre">Tyre</Cell>
            <Cell class="col-laps">Laps</Cell>
            <Cell class="col-fastest">Fastest</Cell>
            <Cell class="col-pressure sortable" on:click={() => handleSort('tyrePressure')}>
              Avg Pressure {sortBy === 'tyrePressure' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </Cell>
            <Cell class="col-ratio sortable" on:click={() => handleSort('gearRatio')}>
              Gear Ratio {sortBy === 'gearRatio' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </Cell>
          </Row>
        </Head>
        <Body>
          {#each sortedSessions as session (session.id)}
            <Row class={"session-row" + (viewMode === 'detailed' ? " detailed-row" : "")}>
              {#if viewMode === 'compact'}
                <div class="clickable-row" on:click={() => handleRowClick(session.id)} on:keydown={(e) => e.key === 'Enter' && handleRowClick(session.id)} tabindex="0" role="button">
                  <Cell class="col-date">{formatDate(session.date)}</Cell>
                  <Cell class="col-track">{getTrackName(session.circuitId)}</Cell>
                  <Cell class="col-session">
                    <div class="session-name">
                      {#if session.isRace}<span class="race-icon">🏁</span>{/if}
                      {session.session}
                    </div>
                  </Cell>
                  <Cell class="col-weather">{getWeatherDescription(session)}</Cell>
                  <Cell class="col-tyre">{session.tyreId ? getTyreName(session.tyreId) : '-'}</Cell>
                  <Cell class="col-laps">{session.laps}</Cell>
                  <Cell class="col-fastest">{formatFastestLap(session.fastest)}</Cell>
                  <Cell class="col-pressure">{getAvgTyrePressure(session)?.toFixed(1) || '-'}</Cell>
                  <Cell class="col-ratio">{getGearRatio(session)?.toFixed(2) || '-'}</Cell>
                </div>
              {:else}
                <div class="clickable-row detailed" on:click={() => handleRowClick(session.id)} on:keydown={(e) => e.key === 'Enter' && handleRowClick(session.id)} tabindex="0" role="button">
                  <Cell class="col-date">{formatDate(session.date)}</Cell>
                  <Cell class="col-track">{getTrackName(session.circuitId)}</Cell>
                  <Cell class="col-session">
                    <div class="session-details">
                      <div class="session-line-1">
                        {#if session.isRace}<span class="race-icon">🏁</span>{/if}
                        {session.session}
                      </div>
                      <div class="session-line-2">
                        Tyre: {session.tyreId ? getTyreName(session.tyreId) : '-'} | 
                        Engine: {session.engineId ? getEngineName(session.engineId) : '-'}
                      </div>
                    </div>
                  </Cell>
                  <Cell class="col-weather">{getWeatherDescription(session)}</Cell>
                  <Cell class="col-tyre">
                    <div class="tyre-details">
                      <div>{session.tyreId ? getTyreName(session.tyreId) : '-'}</div>
                      <div class="pressure-line">{formatTyrePressure(session)}</div>
                    </div>
                  </Cell>
                  <Cell class="col-laps">{session.laps}</Cell>
                  <Cell class="col-fastest">{formatFastestLap(session.fastest)}</Cell>
                  <Cell class="col-pressure">
                    <div class="pressure-details">
                      <div>{getAvgTyrePressure(session)?.toFixed(1) || '-'}</div>
                      <div class="pressure-line">{formatTyrePressure(session)}</div>
                    </div>
                  </Cell>
                  <Cell class="col-ratio">
                    <div>{getGearRatio(session)?.toFixed(2) || '-'}</div>
                    <div class="ratio-line">{formatGearRatio(session)}</div>
                  </Cell>
                </div>
              {/if}
            </Row>
          {/each}
        </Body>
      </DataTable>
    </div>
  {/if}
</div>
