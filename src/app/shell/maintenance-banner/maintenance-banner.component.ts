import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { MaintenanceBannerState, MaintenanceService } from '@core/maintenance.service';

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
  banner: MaintenanceBannerState;
  timer: any;
  private dismissed = false;
  private currentKey = '';
  private subscription = new Subscription();

  constructor(private maintenanceService: MaintenanceService) {
    this.banner = this.maintenanceService.snapshot.banner;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.maintenanceService.state$.subscribe((state) => {
        if (this.currentKey !== state.banner.key) {
          this.currentKey = state.banner.key;
          this.dismissed = false;
        }

        this.banner = state.banner;
        this.clearTimer();
        this.visible = state.banner.show && !this.dismissed;

        if (this.visible && this.autoHideMs && this.autoHideMs > 0) {
          this.startAutoHide();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.subscription.unsubscribe();
  }

  dismiss(): void {
    this.dismissed = true;
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
  }
}
