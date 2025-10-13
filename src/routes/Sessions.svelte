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

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatFastestLap = (time) => {
    if (!time) return '-';
    return `${time.toFixed(2)}`;
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

  // Sort sessions by date (newest first)
  $: sortedSessions = sessions.length > 0 
    ? [...sessions].sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      })
    : [];

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

  // Helper to format tyre pressures using correct property names
  function formatTyrePressures(session) {
    const { frontOuter, frontInner, rearOuter, rearInner } = session;
    // If any are missing, return '-'
    if (
      frontOuter == null ||
      frontInner == null ||
      rearOuter == null ||
      rearInner == null
    ) {
      return '-';
    }
    // All the same
    if (
      frontOuter === frontInner &&
      frontInner === rearOuter &&
      rearOuter === rearInner
    ) {
      return `${frontOuter} psi`;
    }
    // Fronts same, rears same, but fronts != rears
    if (
      frontOuter === frontInner &&
      rearOuter === rearInner &&
      frontOuter !== rearOuter
    ) {
      return `f ${frontOuter} / r ${rearOuter} psi`;
    }
    // All different or some pairs
    return `fo ${frontOuter} / fi ${frontInner} / ro ${rearOuter} / ri ${rearInner} psi`;
  }

  // Helper to format gearing as "front/rear (ratio)"
  function formatGearing(session) {
    const { frontSprocket, rearSprocket } = session;
    const f = Number(frontSprocket);
    const r = Number(rearSprocket);
    if (!f || !r) return '-';
    const ratio = (r / f).toFixed(2).replace(/\.00$/, '');
    return `${f}/${r} (${ratio})`;
  }

  // Columns and directions for sorting
  const sortOptions = [
    { value: 'date-desc', label: 'Date & Time ▼' },
    { value: 'date-asc', label: 'Date & Time ▲' },
    { value: 'weather-desc', label: 'Weather ▼' },
    { value: 'weather-asc', label: 'Weather ▲' },
    { value: 'laps-desc', label: 'Laps ▼' },
    { value: 'laps-asc', label: 'Laps ▲' },
    { value: 'fastest-desc', label: 'Fastest ▼' },
    { value: 'fastest-asc', label: 'Fastest ▲' }
  ];
  let selectedSort = 'date-desc';

  // Add view options
  const viewOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'detailed', label: 'Detailed' }
  ];
  let selectedView = 'compact';

  function getSortValue(session, key) {
    if (key === 'date') {
      const d = session.date?.toDate ? session.date.toDate() : new Date(session.date);
      return d?.getTime?.() ?? 0;
    }
    if (key === 'weather') {
      return session.temp ?? Number.NEGATIVE_INFINITY;
    }
    if (key === 'laps') {
      return session.laps ?? 0;
    }
    if (key === 'fastest') {
      return session.fastest ?? Number.POSITIVE_INFINITY;
    }
    return '';
  }

  $: [sortKey, sortDir] = selectedSort.split('-');
  $: sortedSessions = sessions.length > 0
    ? [...sessions].sort((a, b) => {
        const aVal = getSortValue(a, sortKey);
        const bVal = getSortValue(b, sortKey);
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        // string comparison
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : [];
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
    <div class="table-container {selectedView === 'detailed' ? 'detailed-view' : ''}">
      <div class="table-toolbar">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" bind:value={selectedSort}>
          {#each sortOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
        <!-- Add view select -->
        <label for="view-select" style="margin-left: 1.5em;">View:</label>
        <select id="view-select" bind:value={selectedView}>
          {#each viewOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>
      <DataTable style="width: 100%;">
        <Head>
          <Row>
            <Cell class="col-datetime">Date & Time</Cell>
            <Cell class="col-session">Session</Cell>
            <Cell class="col-circuit">Circuit</Cell>
            <Cell class="col-weather">Weather</Cell>
            <Cell class="col-laps">Laps</Cell>
            <Cell class="col-fastest">Fastest</Cell>
          </Row>
        </Head>
        <Body>
          {#each sortedSessions as session (session.id)}
            <Row class="session-row">
              <div class="clickable-row" on:click={() => handleRowClick(session.id)} on:keydown={(e) => e.key === 'Enter' && handleRowClick(session.id)} tabindex="0" role="button">
                <Cell class="col-datetime">
                  {formatDateTime(session.date)}
                  {#if selectedView === 'detailed'}
                    <div class="session-details-placeholder">
                      {formatGearing(session)}
                    </div>
                  {/if}
                </Cell>
                <Cell class="col-session">
                  <div class="session-name">
                    {#if session.isRace}
                      <span class="race-icon">🏁</span>
                    {/if}
                    {session.session}
                  </div>
                  {#if selectedView === 'detailed'}
                    <div class="session-details-placeholder">
                      {formatTyrePressures(session)}
                    </div>
                  {/if}
                </Cell>
                <Cell class="col-circuit">{getTrackName(session.circuitId)}</Cell>
                <Cell class="col-weather">{getWeatherDescription(session)}</Cell>
                <Cell class="col-laps">{session.laps}</Cell>
                <Cell class="col-fastest">
                  {formatFastestLap(session.fastest)}
                </Cell>
              </div>
            </Row>
          {/each}
        </Body>
      </DataTable>
    </div>
  {/if}
</div>