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

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      sessions = sessions.filter(session => session.id !== sessionId);
    } catch (err) {
      error = err.message;
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

  const groupSessionsByDay = (sessions) => {
    const groups = {};
    
    sessions.forEach(session => {
      const date = session.date.toDate ? session.date.toDate() : new Date(session.date);
      const dateKey = date.toDateString();
      const circuitName = getTrackName(session.circuitId);
      const groupKey = `${dateKey}|${circuitName}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          date: date,
          circuit: circuitName,
          sessions: []
        };
      }
      
      groups[groupKey].sessions.push(session);
    });

    // Sort groups by date (newest first) and sort sessions within each group by time if available
    return Object.values(groups)
      .sort((a, b) => b.date - a.date)
      .map(group => {
        // Find the fastest lap in this group
        const fastestLap = group.sessions
          .filter(s => s.fastest)
          .reduce((fastest, session) => {
            return !fastest || session.fastest < fastest ? session.fastest : fastest;
          }, null);

        return {
          ...group,
          fastestLap,
          sessions: group.sessions.sort((a, b) => {
            // If sessions have time data, sort by that, otherwise maintain original order
            if (a.time && b.time) {
              return a.time - b.time;
            }
            return 0;
          })
        };
      });
  };

  $: groupedSessions = sessions.length > 0 ? groupSessionsByDay(sessions) : [];

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
  <div class="header">
    <h1>My Karting Sessions</h1>
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
    <div class="sessions-groups">
      {#each groupedSessions as group (group.date.getTime() + group.circuit)}
        <div class="session-group">
          <div class="group-header">
            <h3>{group.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <h4>{group.circuit}</h4>
          </div>
          
          <div class="table-container">
            <DataTable style="width: 100%;">
              <Head>
                <Row>
                  <Cell class="col-time">Time</Cell>
                  <Cell class="col-weather">Weather</Cell>
                  <Cell class="col-session">Session</Cell>
                  <Cell class="col-tyre">Tyre</Cell>
                  <Cell class="col-laps">Laps</Cell>
                  <Cell class="col-fastest">Fastest</Cell>
                </Row>
              </Head>
              <Body>
                {#each group.sessions as session (session.id)}
                  <Row class={"session-row" + (session.fastest === group.fastestLap ? " fastest-row" : "")}>
                    <div class="clickable-row" on:click={() => handleRowClick(session.id)} on:keydown={(e) => e.key === 'Enter' && handleRowClick(session.id)} tabindex="0" role="button">
                      <Cell class="col-time">{formatTime(session.date)}</Cell>
                      <Cell class="col-weather">{getWeatherDescription(session)}</Cell>
                      <Cell class="col-session">
                        <div class="session-name">
                          {#if session.isRace}
                            <span class="race-icon">🏁</span>
                          {/if}
                          {session.session}
                        </div>
                      </Cell>
                      <Cell class="col-tyre">{session.tyreId ? getTyreName(session.tyreId) : '-'}</Cell>
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
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .sessions-dashboard {
    max-width: 1200px;
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

  .sessions-groups {
    margin-top: 2rem;
  }

  .session-group {
    margin-bottom: 3rem;
  }

  .group-header {
    margin-bottom: 1rem;
    padding: 1rem 0;
    border-bottom: 2px solid #e9ecef;
  }

  .group-header h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .group-header h4 {
    margin: 0;
    color: #666;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .table-container {
    margin-top: 1rem;
    overflow-x: auto;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background: white;
  }

  :global(.session-row) {
    cursor: pointer;
    transition: background-color 0.2s;
  }

  /* Remove or comment out the generic hover rule to avoid conflicts */
  /* :global(.session-row:hover) {
    background-color: #f8f9fa;
  } */

  /* Alternating row backgrounds */
  :global(.mdc-data-table__row.session-row:nth-of-type(even)) {
    background-color: #f5f6f7;
  }

  /* Fastest row subtle green highlight */
  :global(.mdc-data-table__row.session-row.fastest-row) {
    background-color: #eef9f1;
    font-weight: bold;
  }

  /* Hover states (ensure specificity after base hover rule if any) */
  :global(.mdc-data-table__row.session-row:not(.fastest-row):hover) {
    background-color: #eceeef;
  }
  :global(.mdc-data-table__row.session-row.fastest-row:hover) {
    background-color: #e4f4e8;
  }

  .clickable-row {
    display: contents;
    cursor: pointer;
  }

  .clickable-row:focus {
    outline: 2px solid #007bff;
    outline-offset: -2px;
  }

  :global(.session-row .mdc-data-table__cell) {
    vertical-align: middle;
  }

  .session-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .race-icon {
    font-size: 1.1em;
  }

  /* Consistent column widths across all session tables */
  :global(.sessions-groups .mdc-data-table__table) {
    table-layout: fixed;
    width: 100%;
  }

  :global(.col-time) { width: 10%; }
  :global(.col-weather) { width: 15%; }
  :global(.col-session) { width: 33%; } /* was 35% */
  :global(.col-tyre) { width: 20%; }
  :global(.col-laps) { width: 10%; }
  :global(.col-fastest) { width: 12%; } /* was 10% */

  /* Prevent layout shift with long text */
  :global(.col-session),
  :global(.col-weather),
  :global(.col-tyre) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Responsive column handling:
     Breakpoint 1: hide tyre
     Breakpoint 2: additionally hide weather and laps */
  @media (max-width: 900px) {
    :global(.col-tyre) {
      display: none !important;
    }
  }

  @media (max-width: 640px) {
    :global(.col-tyre),
    :global(.col-weather),
    :global(.col-laps) {
      display: none !important;
    }
  }

  @media (max-width: 768px) {
    .sessions-dashboard {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .table-container {
      margin-top: 1rem;
    }
  }

  /* Larger table font */
  :global(.sessions-groups .mdc-data-table__header-cell),
  :global(.sessions-groups .mdc-data-table__cell) {
    font-size: 0.95rem;
    line-height: 1.35;
  }
</style>