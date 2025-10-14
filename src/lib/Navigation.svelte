<script>
  import { link } from 'svelte-spa-router';
  import { signOut } from 'firebase/auth';
  import { auth } from './firebase.js';
  import { user } from './stores.js';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import Button from '@smui/button';

  let mobileMenuOpen = false;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      mobileMenuOpen = false;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen = !mobileMenuOpen;
  };

  const closeMobileMenu = () => {
    mobileMenuOpen = false;
  };
</script>

<TopAppBar variant="static" style="background-color: #f8f9fa; color: #495057; border-bottom: 1px solid #dee2e6;">
  <Row>
    <Section>
      <Title><a href="/" use:link style="text-decoration: none; color: #007bff; font-weight: bold;">🏎️ Kart Manager</a></Title>
    </Section>
    <Section align="end" toolbar class="desktop-nav">
      <a href="/tyres" use:link class="nav-link">Tyres</a>
      <a href="/engines" use:link class="nav-link">Engines</a>
      <a href="/sessions" use:link class="nav-link">Sessions</a>
      <a href="/tracks" use:link class="nav-link">Tracks</a>
      <div class="user-info">
        <span class="user-email">👤 {$user?.email}</span>
        <Button onclick={handleSignOut} variant="raised" color="secondary" style="background-color: #dc3545;">Sign Out</Button>
      </div>
    </Section>
    <Section align="end" toolbar class="mobile-nav">
      <button class="hamburger-button" on:click={toggleMobileMenu} aria-label="Toggle menu">
        {#if mobileMenuOpen}
          ✕
        {:else}
          ☰
        {/if}
      </button>
    </Section>
  </Row>
</TopAppBar>

<div class="mobile-menu" class:open={mobileMenuOpen}>
  <a href="/tyres" use:link class="mobile-nav-link" on:click={closeMobileMenu}>Tyres</a>
  <a href="/engines" use:link class="mobile-nav-link" on:click={closeMobileMenu}>Engines</a>
  <a href="/sessions" use:link class="mobile-nav-link" on:click={closeMobileMenu}>Sessions</a>
  <a href="/tracks" use:link class="mobile-nav-link" on:click={closeMobileMenu}>Tracks</a>
  <div class="mobile-user-info">
    <span class="user-email">👤 {$user?.email}</span>
    <Button onclick={handleSignOut} variant="raised" color="secondary" style="background-color: #dc3545; width: 100%;">Sign Out</Button>
  </div>
</div>

<style>
  :global(.desktop-nav) {
    display: flex;
    gap: 0.5rem;
  }

  :global(.mobile-nav) {
    display: none;
  }

  .hamburger-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #495057;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }

  .hamburger-button:hover {
    background-color: #e9ecef;
    border-radius: 4px;
  }

  .nav-link {
    text-decoration: none;
    color: #495057;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-link:hover {
    background-color: #e9ecef;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 1px solid #dee2e6;
  }

  .user-email {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .mobile-menu {
    flex-direction: column;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    display: none;
  }

  @media (max-width: 768px) {
    :global(.desktop-nav) {
      display: none;
    }

    :global(.mobile-nav) {
      display: flex;
    }

    .mobile-menu {
      display: flex;
    }

    .mobile-menu.open {
      max-height: 500px;
    }

    .mobile-nav-link {
      text-decoration: none;
      color: #495057;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.2s;
    }

    .mobile-nav-link:hover {
      background-color: #e9ecef;
    }

    .mobile-user-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 2px solid #dee2e6;
    }

    .mobile-user-info .user-email {
      font-size: 0.875rem;
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .user-email {
      max-width: 150px;
    }
  }
</style>
