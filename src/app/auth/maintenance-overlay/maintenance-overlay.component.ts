import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { MaintenanceOverlayState, MaintenanceService } from '@core/maintenance.service';

@Component({
  selector: 'app-maintenance-overlay',
  templateUrl: './maintenance-overlay.component.html',
  styleUrls: ['./maintenance-overlay.component.scss'],
})
export class MaintenanceOverlayComponent implements OnInit, OnDestroy {
  visible = false;
  overlay: MaintenanceOverlayState;
  private subscription = new Subscription();

  constructor(private maintenanceService: MaintenanceService) {
    this.overlay = this.maintenanceService.snapshot.overlay;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.maintenanceService.state$.subscribe((state) => {
        this.overlay = state.overlay;
        this.visible = state.overlay.show;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
