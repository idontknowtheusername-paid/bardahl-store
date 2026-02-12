// Custom client-side logging for Payload admin
if (typeof window !== 'undefined') {
  console.log('[Payload Admin] Custom JS loaded')

  // Log all fetch requests to see API calls
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]
    console.log('[Payload Admin] Fetch request:', url)
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('[Payload Admin] Fetch response:', url, response.status)
        if (!response.ok) {
          console.error('[Payload Admin] Fetch error:', url, response.status, response.statusText)
        }
        return response
      })
      .catch(error => {
        console.error('[Payload Admin] Fetch failed:', url, error)
        throw error
      })
  }

  // Log file input changes
  document.addEventListener('change', (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      console.log('[Payload Admin] File input changed:', {
        files: e.target.files?.length,
        names: Array.from(e.target.files || []).map(f => f.name),
        sizes: Array.from(e.target.files || []).map(f => f.size),
      })
    }
  })

  // Log button clicks on upload buttons
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target instanceof HTMLElement) {
      const button = target.closest('button')
      if (button && (button.textContent?.includes('Upload') || button.textContent?.includes('Télécharger'))) {
        console.log('[Payload Admin] Upload button clicked:', button.textContent)
      }
    }
  })

  // Log errors
  window.addEventListener('error', (e) => {
    console.error('[Payload Admin] Global error:', e.error)
  })

  window.addEventListener('unhandledrejection', (e) => {
    console.error('[Payload Admin] Unhandled promise rejection:', e.reason)
  })

  console.log('[Payload Admin] Monitoring initialized')
}
