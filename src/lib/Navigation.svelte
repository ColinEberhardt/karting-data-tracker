<script>
  import { link } from 'svelte-spa-router';
  import { signOut } from 'firebase/auth';
  import { auth } from './firebase.js';
  import { user } from './stores.js';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import Button from '@smui/button';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
</script>

<TopAppBar variant="static" style="background-color: #f8f9fa; color: #495057; border-bottom: 1px solid #dee2e6;">
  <Row>
    <Section>
      <Title><a href="/" use:link style="text-decoration: none; color: #007bff; font-weight: bold;">🏎️ Kart Manager</a></Title>
    </Section>
    <Section align="end" toolbar style="gap: 0.5rem;">
      <a href="/tyres" use:link class="nav-link">Tyres</a>
      <a href="/engines" use:link class="nav-link">Engines</a>
      <a href="/sessions" use:link class="nav-link">Sessions</a>
      <a href="/tracks" use:link class="nav-link">Tracks</a>
      <div class="user-info">
        <span>👤 {$user?.email}</span>
        <Button onclick={handleSignOut} variant="raised" color="secondary" style="background-color: #dc3545;">Sign Out</Button>
      </div>
    </Section>
  </Row>
</TopAppBar>

<style>
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

  @media (max-width: 768px) {
    .user-info {
      margin-left: 0;
      padding-left: 0;
      border-left: none;
      font-size: 0.875rem;
    }
  }
</style>
