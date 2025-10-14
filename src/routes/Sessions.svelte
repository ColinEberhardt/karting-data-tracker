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

  onMount(loadData);

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

  // Session name filter state
  let sessionFilter = '';
  let filterDropdownOpen = false;
  let filterDropdownActiveIdx = -1;

  // Compute unique session names for dropdown
  $: sessionNames = Array.from(new Set(sessions.map(s => s.session).filter(Boolean))).sort();

  // Filtered sessions based on sessionFilter
  $: filteredSessions = sessionFilter
    ? sortedSessions.filter(s => s.session && s.session.toLowerCase().includes(sessionFilter.toLowerCase()))
    : sortedSessions;

  // For dropdown: show names matching current input, or all if input is empty
  $: filterDropdownOptions = sessionNames.filter(name =>
    !sessionFilter || name.toLowerCase().includes(sessionFilter.toLowerCase())
  );

  function selectSessionFilter(name) {
    sessionFilter = name;
    filterDropdownOpen = false;
    filterDropdownActiveIdx = -1;
  }

  function handleFilterInput(e) {
    sessionFilter = e.target.value;
    filterDropdownOpen = true;
    filterDropdownActiveIdx = 0;
  }

  function handleFilterBlur() {
    setTimeout(() => {
      filterDropdownOpen = false;
      filterDropdownActiveIdx = -1;
    }, 100);
  }

  function handleFilterKeydown(e) {
    if (!filterDropdownOpen || filterDropdownOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      filterDropdownActiveIdx = (filterDropdownActiveIdx + 1) % filterDropdownOptions.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      filterDropdownActiveIdx = (filterDropdownActiveIdx - 1 + filterDropdownOptions.length) % filterDropdownOptions.length;
    } else if (e.key === 'Enter') {
      if (filterDropdownActiveIdx >= 0 && filterDropdownActiveIdx < filterDropdownOptions.length) {
        selectSessionFilter(filterDropdownOptions[filterDropdownActiveIdx]);
      }
    } else if (e.key === 'Escape') {
      filterDropdownOpen = false;
      filterDropdownActiveIdx = -1;
    }
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
          <div class="session-filter-autocomplete">
            <input
              id="session-filter"
              class="session-filter-input"
              type="text"
              placeholder="Session name..."
              bind:value={sessionFilter}
              on:input={handleFilterInput}
              on:focus={() => { filterDropdownOpen = true; filterDropdownActiveIdx = 0; }}
              on:blur={handleFilterBlur}
              on:keydown={handleFilterKeydown}
              autocomplete="off"
              aria-autocomplete="list"
              aria-controls="session-filter-list"
              aria-activedescendant={filterDropdownActiveIdx >= 0 ? `session-filter-item-${filterDropdownActiveIdx}` : undefined}
            />
            {#if filterDropdownOpen && filterDropdownOptions.length > 0}
              <ul
                class="session-filter-dropdown"
                id="session-filter-list"
                role="listbox"
              >
                {#each filterDropdownOptions as name, idx}
                  <li
                    id={"session-filter-item-" + idx}
                    class:selected={idx === filterDropdownActiveIdx}
                    on:mousedown={() => selectSessionFilter(name)}
                    role="option"
                    aria-selected={idx === filterDropdownActiveIdx}
                  >{name}</li>
                {/each}
              </ul>
            {/if}
          </div>
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