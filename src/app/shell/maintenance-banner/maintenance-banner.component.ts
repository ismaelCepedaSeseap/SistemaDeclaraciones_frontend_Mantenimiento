import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss'],
})
export class MaintenanceBannerComponent implements OnInit, OnDestroy {
  @Input() closable = true; // whether to show the close button
  // autoHideMs: number of milliseconds to auto-hide. Set to 0 or null to disable.
  @Input() autoHideMs: number | null = 8000;

  visible = false;
  timer: any;
  // timer used to hide the banner at the configured absolute end
  absoluteHideTimer: any = null;

  ngOnInit(): void {
    // Always show the banner on init (do not persist dismissal)
    this.visible = true;
    // Optional: hide the banner at a specific absolute end date/time.
    // Change this value to the desired end moment. Months are 0-indexed.
    const absoluteEnd: Date | null = new Date(2026, 1, 14, 9, 0, 0); // 2026-02-07 06:00 (as requested)
    const nowMs = Date.now();

    // Debug override: set `localStorage.debugShowBanner = 'true'` to force display
    // during testing (skips scheduling hide by absoluteEnd).
    if (localStorage && localStorage.getItem && localStorage.getItem('debugShowBanner') === 'true') {
      console.debug('[maintenance-banner] debugShowBanner=true -> forcing visible');
      // still start the normal auto-hide if configured
      if (this.autoHideMs && this.autoHideMs > 0) this.startAutoHide();
      return;
    }

    if (absoluteEnd) {
      console.debug('[maintenance-banner] absoluteEnd=', absoluteEnd.toString());
      const endMs = absoluteEnd.getTime();
      if (nowMs >= endMs) {
        // already past the end time -> hide immediately
        this.visible = false;
        return;
      }
      const msToEnd = endMs - nowMs;
      // schedule hide at absolute end
      this.absoluteHideTimer = setTimeout(() => this.dismiss(), msToEnd);
    }

    // start auto-hide only if autoHideMs is a positive number
    if (this.autoHideMs && this.autoHideMs > 0) {
      this.startAutoHide();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // Dismiss the banner. Do NOT persist so it will reappear on next visit.
  dismiss(): void {
    this.visible = false;
    this.clearTimer();
  }

  private startAutoHide() {
    this.clearTimer();
    this.timer = setTimeout(() => this.dismiss(), this.autoHideMs as number);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.absoluteHideTimer) {
      clearTimeout(this.absoluteHideTimer);
      this.absoluteHideTimer = null;
    }
  }
}
