<script>
  import { onMount } from 'svelte';
  import Button from '@smui/button';
  import Paper from '@smui/paper';
  
  let deferredPrompt = null;
  let showInstallPrompt = false;
  let isInstalled = false;
  let isIOS = false;
  let showIOSPrompt = false;
  
  onMount(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      return;
    }
    
    // Detect iOS
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Show iOS prompt if on iOS and not installed
    if (isIOS && !isInstalled) {
      // Check if user has dismissed it before
      const dismissed = localStorage.getItem('ios-install-prompt-dismissed');
      if (!dismissed) {
        showIOSPrompt = true;
      }
    }
    
    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt = true;
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      showInstallPrompt = false;
      isInstalled = true;
    });
  });
  
  async function handleInstallClick() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    showInstallPrompt = false;
  }
  
  function handleDismiss() {
    showInstallPrompt = false;
  }
  
  function handleIOSDismiss() {
    showIOSPrompt = false;
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
  }
</script>

{#if showInstallPrompt && !isInstalled}
  <div class="install-banner">
    <Paper elevation={3} class="install-paper">
      <div class="install-content">
        <div class="install-icon">
          <span class="material-icons">get_app</span>
        </div>
        <div class="install-text">
          <h3>Install KartLog</h3>
          <p>Install this app for quick access and offline support</p>
        </div>
        <div class="install-actions">
          <Button on:click={handleInstallClick} variant="raised" color="primary">
            Install
          </Button>
          <Button on:click={handleDismiss} variant="outlined">
            Not Now
          </Button>
        </div>
      </div>
    </Paper>
  </div>
{/if}

{#if showIOSPrompt && !isInstalled}
  <div class="install-banner">
    <Paper elevation={3} class="install-paper">
      <div class="install-content">
        <div class="install-icon ios-icon">
          <span class="material-icons">ios_share</span>
        </div>
        <div class="install-text">
          <h3>Install KartLog</h3>
          <p>Tap <span class="material-icons share-icon">ios_share</span> then "Add to Home Screen"</p>
        </div>
        <div class="install-actions">
          <Button on:click={handleIOSDismiss} variant="outlined">
            Got it
          </Button>
        </div>
      </div>
    </Paper>
  </div>
{/if}

<style>
  .install-banner {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    max-width: 500px;
    width: calc(100% - 40px);
  }
  
  :global(.install-paper) {
    padding: 16px;
  }
  
  .install-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .install-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--mdc-theme-primary, #1976d2);
    border-radius: 50%;
    color: white;
  }
  
  .install-icon .material-icons {
    font-size: 28px;
  }
  
  .ios-icon {
    background: var(--mdc-theme-primary, #1976d2) !important;
  }
  
  .share-icon {
    font-size: 18px;
    vertical-align: middle;
    color: var(--mdc-theme-primary, #1976d2);
  }
  
  .install-text {
    flex: 1;
    min-width: 200px;
  }
  
  .install-text h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .install-text p {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .install-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  @media (max-width: 600px) {
    .install-content {
      flex-direction: column;
      text-align: center;
    }
    
    .install-actions {
      width: 100%;
      justify-content: center;
    }
  }
</style>
