import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-maintenance-overlay',
  templateUrl: './maintenance-overlay.component.html',
  styleUrls: ['./maintenance-overlay.component.scss'],
})
export class MaintenanceOverlayComponent implements OnInit, OnDestroy {
  visible = true;
  private showTimer: any = null;
  private hideTimer: any = null;
  private startTimeMs: number | null = null;
  private endTimeMs: number | null = null;

  ngOnInit(): void {
    // Optional: provide absolute start/end dates (include year/month/day).
    // If both `absoluteStart` and `absoluteEnd` are non-null, the overlay
    // will be scheduled using these exact Date objects. Set either to
    // `null` to fall back to the time-of-day scheduling below.
    // Example: Feb 6 2026 17:03 -> new Date(2026, 1, 6, 17, 3, 0)
    // Default absolute maintenance window: start Friday, Feb 6 2026 00:00
    // and end Saturday, Feb 7 2026 00:00 (local time). Change the
    // hour/minute arguments below if you need specific times on those dates.
    // Requested production/test window: start 6 Feb 2026 17:03, end 7 Feb 2026 06:00
    // (months are 0-indexed: February = 1)
    const absoluteStart: Date | null = new Date(2026, 1, 13, 0, 0, 0); // 2026-02-06 17:03
    const absoluteEnd: Date | null = new Date(2026, 1, 14, 9, 0, 0);    // 2026-02-07 06:00

    const nowMs = Date.now();

    // Debug override: set `localStorage.debugShowOverlay = 'true'` to force display
    // regardless of the configured window (useful for testing).
    if (localStorage && localStorage.getItem && localStorage.getItem('debugShowOverlay') === 'true') {
      console.debug('[maintenance-overlay] debugShowOverlay= true -> forcing visible');
      this.visible = true;
      return;
    }

    // If absolute dates are provided, use them (they represent exact moments in time)
    if (absoluteStart && absoluteEnd) {
      console.debug('[maintenance-overlay] absoluteStart=', absoluteStart.toString(), 'absoluteEnd=', absoluteEnd.toString());
      this.startTimeMs = absoluteStart.getTime();
      this.endTimeMs = absoluteEnd.getTime();

      if (this.endTimeMs <= this.startTimeMs) {
        // It's invalid for the absolute end to be before or equal to start.
        // Log a warning and don't show the overlay. If you expect windows
        // that span multiple days, provide an `absoluteEnd` that is after
        // `absoluteStart` (with the correct date component).
        console.warn('[maintenance-overlay] absoluteEnd <= absoluteStart — overlay disabled');
        this.visible = false;
        return;
      }

      if (nowMs >= this.startTimeMs && nowMs < this.endTimeMs) {
        // We're inside the absolute maintenance window now.
        this.show();
        this.scheduleHide(this.endTimeMs - nowMs);
         this.visible = true;
      } else if (nowMs < this.startTimeMs) {
        // Schedule show at the absolute start, and hide at the absolute end.
        this.visible = false;
        this.scheduleShow(this.startTimeMs - nowMs);
      } else {
        // now >= end -> window already passed
        this.visible = false;
      }

      return; // done
    }

    // Fallback: schedule by time-of-day for today (original behavior).
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // NOTE: ensure end is after start; if end <= start, treat end as next day
    const start = new Date(year, month, day, 17, 3, 0, 0);
    let end = new Date(year, month, day, 17, 10, 0, 0);
    if (end.getTime() <= start.getTime()) {
      // end is earlier than start -> assume maintenance window spans to next day
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }
    this.startTimeMs = start.getTime();
    this.endTimeMs = end.getTime();

    if (now.getTime() >= start.getTime() && now.getTime() < end.getTime()) {
      // we're within the maintenance window now
      this.show();
      const hideDelay = end.getTime() - now.getTime();
      if (hideDelay > 0) {
        this.scheduleHide(hideDelay);
      } else {
        // end already passed (edge) -> hide immediately
        this.hide();
      }
    } else if (now < start) {
      // schedule show at start, and hide at end
      const showDelay = start.getTime() - now.getTime();
      if (showDelay > 0) {
        this.scheduleShow(showDelay);
      } else {
        // if delay is non-positive, show immediately
        this.show();
        const hideDelay = end.getTime() - Date.now();
        if (hideDelay > 0) this.scheduleHide(hideDelay);
      }
    } else {
      // now >= end -> do nothing (window passed)
      this.visible = false;
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private show() {
    this.visible = true;
  }

  private hide() {
    this.visible = false;
  }

  private scheduleShow(ms: number) {
    this.clearTimers();
    this.showTimer = setTimeout(() => {
      this.show();
      // after showing, schedule hide at the configured end time
      if (this.endTimeMs) {
        const delay = Math.max(0, this.endTimeMs - Date.now());
        if (delay > 0) {
          this.scheduleHide(delay);
        }
      }
    }, ms);
  }

  private scheduleHide(ms: number) {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    this.hideTimer = setTimeout(() => this.hide(), ms);
  }

  private clearTimers() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
