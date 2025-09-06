<script>
  import { link } from 'svelte-spa-router';
  import { signOut } from 'firebase/auth';
  import { auth } from './firebase.js';
  import { user } from './stores.js';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
</script>

<nav class="navbar">
  <div class="nav-brand">
    <a href="/" use:link>🏎️ Kart Manager</a>
  </div>
  
  <div class="nav-links">
    <a href="/tyres" use:link>Tyres</a>
    
    <div class="user-info">
      <span>👤 {$user?.email}</span>
      <button on:click={handleSignOut} class="sign-out-btn">Sign Out</button>
    </div>
  </div>
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 2rem;
  }

  .nav-brand a {
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
    color: #007bff;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-links a {
    text-decoration: none;
    color: #495057;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-links a:hover {
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

  .sign-out-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sign-out-btn:hover {
    background-color: #c82333;
  }

  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      gap: 1rem;
    }

    .nav-links {
      flex-wrap: wrap;
      justify-content: center;
    }

    .user-info {
      margin-left: 0;
      padding-left: 0;
      border-left: none;
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }
  }
</style>
