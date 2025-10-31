<script>
  import { link } from 'svelte-spa-router';
  // base URL (useful in production when site is served from a subpath)
  const base = import.meta.env.BASE_URL || '/';
  // Marketing page for the KartLog app
  const features = [
    {icon: '🛞', title: 'Track tyres & engines', desc: 'Record tyre and engine usage, wear, and history to know what works best.'},
    {icon: '⏱️', title: 'Session logging', desc: 'Log lap sessions, times, and notes per track and conditions.'},
    {icon: '🌤️', title: 'Auto weather lookup', desc: 'Automatically fetch weather for session locations and attach temperature, humidity and track conditions to each session.'},
    {icon: '🔒', title: 'User-based data', desc: 'Secure user accounts with Firebase Auth so your data stays private.'},
    {icon: '🔎', title: 'Search and filters', desc: 'Quickly find sessions and tyres with powerful filters and tags.'},
    {icon: '🏁', title: 'Track storage & lap times', desc: 'Save tracks and record your fastest lap time per track so you can compare personal bests and progress.'},
    {icon: '🏆', title: 'Save race results', desc: 'Record race finishing positions, points and notes.'},
    {icon: '📱', title: 'Progressive Web App (PWA)', desc: 'Install the app to your device directly from the browser — no App Store needed. Works offline and supports add-to-home-screen.'}
  ];
</script>

<svelte:head>
  <title>KartLog — Karting Tyre & Session Tracker</title>
  <meta name="description" content="KartLog helps kart racers track tyres, engines and sessions. Log sessions, compare tyres and keep your maintenance history." />
</svelte:head>

<section class="hero">
  <div class="content">
    <h1>KartLog</h1>
    <p class="tagline">Track tyres, engines and sessions. Make better setup decisions faster.</p>
    <p class="meta">Free &amp; open source</p>
    <p class="cta-row">
      <a href="/login" use:link class="btn primary">Open App</a>
      <a href="https://github.com/ColinEberhardt/kartlog" target="_blank" rel="noopener" class="btn github">
        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" width="16" height="16">
          <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.01-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.27 3.38.97.11-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.18 3.17-1.18.63 1.57.23 2.73.11 3.02.74.81 1.19 1.83 1.19 3.09 0 4.44-2.71 5.41-5.29 5.69.42.36.8 1.08.8 2.18 0 1.58-.01 2.86-.01 3.25 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
        </svg>
        View on GitHub
      </a>
    </p>
  </div>
    <div class="hero-image">
    <img src="{base}tracks.png" alt="Tracks screenshot" />
  </div>
</section>

<section class="features">
  <h2>Features</h2>
  <div class="feature-grid">
    {#each features as f}
      <article class="feature">
        <h3><span class="feature-icon" aria-hidden="true">{f.icon}</span> {f.title}</h3>
        <p>{f.desc}</p>
      </article>
    {/each}
  </div>
</section>

<section class="gallery">
  <h2>Screenshots</h2>
    <div class="screens">
    <img src="{base}sessions.png" alt="Sessions screen" />
    <img src="{base}dashboard.png" alt="Dashboard screen" />
    <img src="{base}tracks.png" alt="Tracks screen" />
  </div>
</section>

<style>
  .hero {
    display: flex;
    gap: 2rem;
    align-items: center;
    padding: 3rem 2rem;
    background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
  }

  .content {
    flex: 1;
    max-width: 640px;
  }

  h1 { font-size: 2.25rem; margin: 0 0 0.5rem 0; }
  .tagline { color: #6c757d; margin: 0 0 1rem 0; }
  .cta-row { display: flex; gap: 1rem; margin-top: 1rem; }

  .meta { color: #495057; font-size: 0.95rem; margin: 0.25rem 0 0; }

  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.6rem 1rem; text-decoration: none; border-radius: 6px; border: 1px solid #ced4da; color: #212529; text-align: center; }
  .btn.primary { background: #007bff; color: #fff; border-color: #007bff; }
  .btn.github { display: inline-flex; align-items: center; gap: 0.5rem; background: #ffffff; color: #24292e; border-color: #d1d5da; }
  .btn.github:hover { background: #f6f8fa; }
  .github-icon { display: inline-block; vertical-align: middle; }

  .hero-image img { max-width: 420px; width: 100%; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }

  /* On narrow screens stack the hero content and place the screenshot below the text */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      align-items: flex-start;
      padding: 2rem 1rem;
    }

    .hero-image {
      margin-top: 1rem;
      width: 100%;
    }

    .hero-image img {
      max-width: 100%;
      width: 100%;
    }

    .cta-row {
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn {
      width: 100%;
      justify-content: center;
    }
  }

  .features { padding: 2rem; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
  .feature { background: #fff; border: 1px solid #e9ecef; padding: 1rem; border-radius: 8px; }
  .feature-icon { font-size: 1.25rem; margin-right: 0.5rem; vertical-align: middle; display: inline-block; }

  .gallery { padding: 2rem; background: #f8f9fa; }
  .screens { display: flex; gap: 1rem; flex-wrap: wrap; }
  .screens img { width: 320px; max-width: 100%; border-radius: 6px; border: 1px solid #e9ecef; }

  /* removed unused .about styles */
</style>
