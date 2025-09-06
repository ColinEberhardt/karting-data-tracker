<script>
  import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
  import { auth } from '../lib/firebase.js';

  let email = '';
  let password = '';
  let isSignUp = false;
  let error = '';
  let loading = false;

  const handleEmailAuth = async () => {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    loading = true;
    error = '';

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleGoogleAuth = async () => {
    loading = true;
    error = '';

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const toggleMode = () => {
    isSignUp = !isSignUp;
    error = '';
  };
</script>

<div class="login-container">
  <div class="login-card">
    <h1>🏎️ Kart Manager</h1>
    <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleEmailAuth}>
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" class="auth-btn primary" disabled={loading}>
        {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
      </button>
    </form>

    <div class="divider">
      <span>or</span>
    </div>

    <button on:click={handleGoogleAuth} class="auth-btn google" disabled={loading}>
      <span class="google-icon">🔑</span>
      Continue with Google
    </button>

    <div class="toggle-mode">
      <p>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button on:click={toggleMode} class="link-btn" disabled={loading}>
          {isSignUp ? 'Sign In' : 'Create Account'}
        </button>
      </p>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 2rem;
  }

  .login-card {
    background: white;
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    text-align: center;
    color: #007bff;
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  h2 {
    text-align: center;
    color: #495057;
    margin-bottom: 2rem;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #495057;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .auth-btn {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 1rem;
  }

  .auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary {
    background-color: #007bff;
    color: white;
  }

  .primary:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .google {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ced4da;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .google:hover:not(:disabled) {
    background-color: #e9ecef;
  }

  .google-icon {
    font-size: 1.2rem;
  }

  .divider {
    text-align: center;
    margin: 1.5rem 0;
    position: relative;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #ced4da;
  }

  .divider span {
    background: white;
    padding: 0 1rem;
    color: #6c757d;
  }

  .toggle-mode {
    text-align: center;
    margin-top: 2rem;
  }

  .toggle-mode p {
    color: #6c757d;
    margin: 0;
  }

  .link-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    font-size: inherit;
  }

  .link-btn:hover:not(:disabled) {
    color: #0056b3;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }
</style>
