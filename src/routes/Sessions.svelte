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