/**
 * Manages favicon switching to indicate unseen terminal updates
 * - Uses terminal.png as default
 * - Switches to terminal_attn.png when events occur while window is unfocused
 */
export class FaviconManager {
  private isFocused: boolean = true
  private hasUnseenUpdates: boolean = false
  private faviconElement: HTMLLinkElement | null = null

  constructor() {
    this.initFavicon()
    this.setupFocusListeners()
  }

  private initFavicon(): void {
    // Find or create favicon element
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/png'
      document.head.appendChild(favicon)
    }
    this.faviconElement = favicon
    this.updateFavicon()
  }

  private setupFocusListeners(): void {
    window.addEventListener('focus', () => {
      this.isFocused = true
      this.hasUnseenUpdates = false
      this.updateFavicon()
    })

    window.addEventListener('blur', () => {
      this.isFocused = false
    })
  }

  /**
   * Call this whenever a terminal event occurs (output, command execution, etc.)
   */
  public notifyUpdate(): void {
    if (!this.isFocused) {
      this.hasUnseenUpdates = true
      this.updateFavicon()
    }
  }

  private updateFavicon(): void {
    if (!this.faviconElement) return

    const href = this.hasUnseenUpdates ? '/terminal_attn.png' : '/terminal.png'
    this.faviconElement.href = href
  }
}
