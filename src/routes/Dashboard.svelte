<script>
  import { onMount } from 'svelte';
  import { link, push } from 'svelte-spa-router';
  import { getUserTyres } from '../lib/tyres.js';
  import { getUserEngines } from '../lib/engines.js';
  import { getUserSessions } from '../lib/sessions.js';
  import { getUserTracks } from '../lib/tracks.js';
  import Card from '@smui/card';
  import Button from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import DataTable, { Head, Body, Row, Cell as TableCell } from '@smui/data-table';
  import {
    formatDate,
    formatTime,
    formatFastestLap,
    formatTyrePressures,
    formatGearing,
    formatWeather,
    weatherCodeEmoji
  } from '../lib/sessionFormat.js';
  import './table.css';
  import './sessions.css';

  let tyres = [];
  let engines = [];
  let sessions = [];
  let tracks = [];
  let loading = true;
  let error = '';

  const loadData = async () => {
    try {
      loading = true;
      const [tyresData, enginesData, sessionsData, tracksData] = await Promise.all([
        getUserTyres(),
        getUserEngines(),
        getUserSessions(),
        getUserTracks()
      ]);
      tyres = tyresData;
      engines = enginesData;
      sessions = sessionsData;
      tracks = tracksData;
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

  const handleRowClick = (sessionId) => {
    push(`/sessions/view/${sessionId}`);
  };

  // Helper to get day key for grouping
  function getDayKey(date) {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  }

  // Get sessions from the most recent day
  $: sortedSessions = sessions.length > 0 
    ? [...sessions].sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      })
    : [];

  $: mostRecentDaySessions = sortedSessions.length > 0 
    ? (() => {
        const mostRecentDay = getDayKey(sortedSessions[0].date);
        return sortedSessions.filter(s => getDayKey(s.date) === mostRecentDay);
      })()
    : [];

  onMount(loadData);
</script>

<div class="container container-lg">
  <div class="page-header">
    <h1>Dashboard</h1>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <CircularProgress style="height: 48px; width: 48px;" indeterminate />
      <p>Loading dashboard...</p>
    </div>
  {:else}
    <LayoutGrid>
      <Cell spanDevices={{ desktop: 3, tablet: 4, phone: 4 }}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🏁</div>
            <h3>Sessions</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{sessions.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/sessions" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell spanDevices={{ desktop: 3, tablet: 4, phone: 4 }}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🛞</div>
            <h3>Tyres</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{tyres.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/tyres" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell spanDevices={{ desktop: 3, tablet: 4, phone: 4 }}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">⚙️</div>
            <h3>Engines</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{engines.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/engines" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>

      <Cell spanDevices={{ desktop: 3, tablet: 4, phone: 4 }}>
        <Card class="card-hover">
          <div class="card-header card-header-active">
            <div class="stat-icon">🏁</div>
            <h3>Tracks</h3>
          </div>
          <div class="card-details">
            <div class="stat-number">{tracks.length}</div>
          </div>
          <div class="card-actions">
            <Button href="/tracks" tag="a" use={[link]} variant="outlined">View All</Button>
          </div>
        </Card>
      </Cell>
    </LayoutGrid>

    {#if mostRecentDaySessions.length > 0}
      <div class="recent-sessions-section" style="margin-top: 2rem;">
        <h2 style="margin-bottom: 1rem;">Recent Sessions</h2>
        <div class="table-container">
          <DataTable style="width: 100%;">
            <Head>
              <Row>
                <TableCell class="col-time">Time</TableCell>
                <TableCell class="col-session">Session</TableCell>
                <TableCell class="col-weather">Weather</TableCell>
                <TableCell class="col-laps">Laps</TableCell>
                <TableCell class="col-fastest">Fastest</TableCell>
              </Row>
            </Head>
            <Body>
              {@const firstSession = mostRecentDaySessions[0]}
              <!-- Day header row -->
              <Row class="day-header-row">
                <TableCell colspan="5" class="day-header">
                  <div class="day-header-content">
                    <span class="day-date">📅 {formatDate(firstSession.date)}</span>
                    <span class="day-track">📍 {getTrackName(firstSession.circuitId)}</span>
                  </div>
                </TableCell>
              </Row>
              <!-- Session rows -->
              {#each mostRecentDaySessions as session (session.id)}
                <Row class="session-row">
                  <div class="clickable-row" on:click={() => handleRowClick(session.id)} on:keydown={(e) => e.key === 'Enter' && handleRowClick(session.id)} tabindex="0" role="button">
                    <TableCell class="col-time">
                      {formatTime(session.date)}
                    </TableCell>
                    <TableCell class="col-session">
                      <div class="session-name">
                        {#if session.isRace}
                          <span class="race-icon">🏁</span>
                        {/if}
                        {session.session}
                      </div>
                      {@const tyre = formatTyrePressures(session)}
                      {@const gear = formatGearing(session)}
                      <div class="session-details">
                        {#if tyre !== '-'}🛞 {tyre}{/if}
                        {#if tyre !== '-' && gear !== '-'} · {/if}
                        {#if gear !== '-'}⚙️ {gear}{/if}
                      </div>
                      <div class="session-inline">
                        <div class="inline-time">{formatTime(session.date)}</div>
                        <div class="inline-weather">{weatherCodeEmoji(session.weatherCode)} {formatWeather(session)}°C</div>
                      </div>
                    </TableCell>
                    <TableCell class="col-weather">
                      {weatherCodeEmoji(session.weatherCode)} {formatWeather(session)}°C
                    </TableCell>
                    <TableCell class="col-laps">
                      {session.laps}
                      {#if session.isRace && session.startPos && session.endPos}
                        {#key session.id}
                          {@const delta = session.startPos - session.endPos}
                          {@const deltaSign = delta > 0 ? '+' : ''}
                          <div class="session-details">
                            <span class="race-result">
                              {session.endPos}/{session.entries} 
                              <span class="delta {delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}">
                                ({deltaSign}{delta})
                              </span>
                              {#if session.penalties}
                                <span class="penalty-marker">*</span>
                              {/if}
                            </span>
                          </div>
                        {/key}
                      {/if}
                    </TableCell>
                    <TableCell class="col-fastest">
                      {formatFastestLap(session.fastest)}
                      {#if session.laps != null}
                        <div class="inline-laps">{session.laps} laps</div>
                      {/if}
                    </TableCell>
                  </div>
                </Row>
              {/each}
            </Body>
          </DataTable>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .stat-icon {
    font-size: 3rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 1.5rem;
  }
</style>
