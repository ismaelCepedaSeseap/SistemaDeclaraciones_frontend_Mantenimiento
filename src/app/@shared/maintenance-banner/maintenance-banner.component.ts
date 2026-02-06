import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss'],
})
export class MaintenanceBannerComponent implements OnInit {
  showBanner = false;

  ngOnInit(): void {
    const bannerClosed = localStorage.getItem('maintenanceBannerClosed');
    if (!bannerClosed) {
      this.showBanner = true;
    }
  }

  closeBanner() {
    this.showBanner = false;
    localStorage.setItem('maintenanceBannerClosed', 'true');
  }
}
