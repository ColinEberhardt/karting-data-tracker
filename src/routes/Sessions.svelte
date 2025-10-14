<script>
  import { onMount } from 'svelte';
  import { link, push, location, querystring } from 'svelte-spa-router';
  import { getUserSessions, deleteSession } from '../lib/sessions.js';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserTracks } from '../lib/tracks.js';
  import { getUserEngines } from '../lib/engines.js';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import FilterPills from '../components/FilterPills.svelte';
  import './table.css';
  import './sessions.css';
  import {
    formatDateTime,
    formatFastestLap,
    formatTyrePressures,
    formatGearing,
    formatWeather
  } from '../lib/sessionFormat.js';

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

  // Multi-property filter state
  let selectedFilters = []; // Array of { type: 'session'|'tyre'|'track'|'engine'|'weather', id: string, label: string }
  let isInitialized = false; // Track if we've loaded data and initialized filters
  let lastUrlFilters = ''; // Track the last URL state to prevent unnecessary updates
  let filteredSessions = []; // Filtered list of sessions

  // Parse filters from URL query string
  function parseFiltersFromURL() {
    const params = new URLSearchParams($querystring);
    const filterParam = params.get('filters');
    if (!filterParam) return [];
    
    try {
      return JSON.parse(decodeURIComponent(filterParam));
    } catch (e) {
      console.error('Failed to parse filters from URL:', e);
      return [];
    }
  }

  // Update URL with current filters
  function updateURL() {
    if (!isInitialized) return; // Don't update URL during initialization
    
    const currentFilterString = JSON.stringify(selectedFilters);
    if (currentFilterString === lastUrlFilters) return; // No change, skip update
    
    lastUrlFilters = currentFilterString;
    
    const params = new URLSearchParams($querystring);
    
    if (selectedFilters.length > 0) {
      params.set('filters', encodeURIComponent(currentFilterString));
    } else {
      params.delete('filters');
    }
    
    const queryString = params.toString();
    const newPath = queryString ? `/sessions?${queryString}` : '/sessions';
    push(newPath);
  }

  // Watch for filter changes and update URL
  $: if (isInitialized) {
    selectedFilters; // Trigger reactivity
    updateURL();
  }

  // Initialize filters from URL on mount
  onMount(async () => {
    await loadData();
    const urlFilters = parseFiltersFromURL();
    lastUrlFilters = JSON.stringify(urlFilters); // Set initial state
    selectedFilters = urlFilters;
    // Small delay to ensure reactive statements have processed
    setTimeout(() => {
      isInitialized = true;
    }, 0);
  });

  // Define pill colors for different filter types
  const pillColors = {
    session: 'session',
    tyre: 'tyre',
    track: 'track',
    engine: 'engine',
    weather: 'weather'
  };

  // Get sessions that match currently selected filters (for progressive filtering)
  $: sessionsMatchingCurrentFilters = selectedFilters.length === 0
    ? sessions
    : sessions.filter(session => {
        return selectedFilters.every(filter => {
          if (filter.type === 'session') {
            return session.session && session.session.toLowerCase().includes(filter.id.toLowerCase());
          } else if (filter.type === 'tyre') {
            return session.tyreId === filter.id;
          } else if (filter.type === 'track') {
            return session.circuitId === filter.id;
          } else if (filter.type === 'engine') {
            return session.engineId === filter.id;
          } else if (filter.type === 'weather') {
            return session.condition && session.condition.trim() === filter.id;
          }
          return true;
        });
      });

  // Compute unique session names and tyres for dropdown (from filtered sessions)
  $: sessionNames = Array.from(new Set(sessionsMatchingCurrentFilters.map(s => s.session).filter(Boolean))).sort();
  $: tyreNamesFromSessions = Array.from(new Set(sessionsMatchingCurrentFilters.map(s => s.tyreId).filter(Boolean)));
  $: tyreNames = tyres
    .filter(t => tyreNamesFromSessions.includes(t.id))
    .map(t => ({
      id: t.id,
      label: t.name || `${t.make} ${t.type}`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  $: trackNamesFromSessions = Array.from(new Set(sessionsMatchingCurrentFilters.map(s => s.circuitId).filter(Boolean)));
  $: trackNames = tracks
    .filter(t => trackNamesFromSessions.includes(t.id))
    .map(t => ({
      id: t.id,
      label: t.name
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  $: engineNamesFromSessions = Array.from(new Set(sessionsMatchingCurrentFilters.map(s => s.engineId).filter(Boolean)));
  $: engineNames = engines
    .filter(e => engineNamesFromSessions.includes(e.id))
    .map(e => ({
      id: e.id,
      label: e.name || `${e.make} ${e.model}`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  
  // Extract unique weather conditions from filtered sessions
  $: weatherConditions = Array.from(new Set(
    sessionsMatchingCurrentFilters
      .filter(s => s.condition && s.condition.trim() !== '')
      .map(s => s.condition.trim())
  )).sort();

  // Combine filter options with type suffixes
  $: filterDropdownOptions = [
    ...sessionNames
      .map(name => ({ type: 'session', id: name, label: `${name} (session)` })),
    ...tyreNames
      .map(tyre => ({ type: 'tyre', id: tyre.id, label: `${tyre.label} (tyre)` })),
    ...trackNames
      .map(track => ({ type: 'track', id: track.id, label: `${track.label} (track)` })),
    ...engineNames
      .map(engine => ({ type: 'engine', id: engine.id, label: `${engine.label} (engine)` })),
    ...weatherConditions
      .map(weather => ({ type: 'weather', id: weather, label: `${weather} (weather)` }))
  ];

  // Filtered sessions based on selected filter pills
  $: filteredSessions = selectedFilters.length === 0
    ? sortedSessions
    : sortedSessions.filter(session => {
        return selectedFilters.every(filter => {
          if (filter.type === 'session') {
            return session.session && session.session.toLowerCase().includes(filter.id.toLowerCase());
          } else if (filter.type === 'tyre') {
            return session.tyreId === filter.id;
          } else if (filter.type === 'track') {
            return session.circuitId === filter.id;
          } else if (filter.type === 'engine') {
            return session.engineId === filter.id;
          } else if (filter.type === 'weather') {
            return session.condition && session.condition.trim() === filter.id;
          }
          return true;
        });
      });

  // Event handlers for FilterPills component
  function handleAddFilter(event) {
    const option = event.detail;
    // Remove the type suffix from the label for display
    const cleanLabel = option.label
      .replace(' (session)', '')
      .replace(' (tyre)', '')
      .replace(' (track)', '')
      .replace(' (engine)', '')
      .replace(' (weather)', '');
    
    selectedFilters = [...selectedFilters, {
      type: option.type,
      id: option.id,
      label: cleanLabel
    }];
  }

  function handleRemoveFilter(event) {
    const index = event.detail;
    selectedFilters = selectedFilters.filter((_, i) => i !== index);
  }

  function handleRemoveLastFilter() {
    selectedFilters = selectedFilters.slice(0, -1);
  }
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
        <div class="session-filter-group">
          <label for="session-filter">Filter:</label>
          <FilterPills
            {selectedFilters}
            filterOptions={filterDropdownOptions}
            placeholder={selectedFilters.length === 0 ? "Filter by session, track ..." : ""}
            {pillColors}
            on:add={handleAddFilter}
            on:remove={handleRemoveFilter}
            on:removeLast={handleRemoveLastFilter}
          />
        </div>
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" bind:value={selectedSort}>
          {#each sortOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
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
          {#each filteredSessions as session (session.id)}
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
                <Cell class="col-weather">{formatWeather(session)}</Cell>
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