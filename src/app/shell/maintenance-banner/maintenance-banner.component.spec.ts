import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MaintenanceService } from '@core/maintenance.service';
import { MaintenanceBannerComponent } from './maintenance-banner.component';

const maintenanceServiceMock = {
  snapshot: {
    banner: {
      key: 'test-banner',
      show: false,
      title: 'Ventana de mantenimiento',
      message: 'Mensaje de prueba',
    },
  },
  state$: of({
    loaded: true,
    version: 'test-version',
    banner: {
      key: 'test-banner',
      show: false,
      title: 'Ventana de mantenimiento',
      message: 'Mensaje de prueba',
    },
    overlay: {
      key: 'test-overlay',
      show: false,
      title: 'Sitio en mantenimiento',
      subtitle: '',
      statusLabel: '',
      statusValue: '',
      resumeLabel: '',
      resumeValue: '',
    },
  }),
};

describe('MaintenanceBannerComponent', () => {
  let component: MaintenanceBannerComponent;
  let fixture: ComponentFixture<MaintenanceBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaintenanceBannerComponent],
      providers: [{ provide: MaintenanceService, useValue: maintenanceServiceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
