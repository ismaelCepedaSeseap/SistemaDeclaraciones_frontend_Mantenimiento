import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MaintenanceRemoteSection {
  enabled?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  title?: string;
  message?: string;
  subtitle?: string;
  statusLabel?: string;
  statusValue?: string;
  resumeLabel?: string;
  resumeValue?: string;
}

export interface MaintenanceRemoteConfig {
  version?: string;
  refreshMs?: number;
  banner?: MaintenanceRemoteSection;
  overlay?: MaintenanceRemoteSection;
}

export interface MaintenanceBannerState {
  key: string;
  show: boolean;
  title: string;
  message: string;
}

export interface MaintenanceOverlayState {
  key: string;
  show: boolean;
  title: string;
  subtitle: string;
  statusLabel: string;
  statusValue: string;
  resumeLabel: string;
  resumeValue: string;
}

export interface MaintenanceState {
  loaded: boolean;
  version: string;
  banner: MaintenanceBannerState;
  overlay: MaintenanceOverlayState;
}

const DEFAULT_REFRESH_MS = 30000;

const DEFAULT_STATE: MaintenanceState = {
  loaded: false,
  version: 'default',
  banner: {
    key: 'default-banner',
    show: false,
    title: 'Ventana de mantenimiento',
    message: '',
  },
  overlay: {
    key: 'default-overlay',
    show: false,
    title: 'Sitio en mantenimiento',
    subtitle: 'Estamos realizando mejoras para brindarte un mejor servicio.',
    statusLabel: 'Estado del Sistema',
    statusValue: 'Actualizando',
    resumeLabel: 'Reanudación del Sistema',
    resumeValue: '',
  },
};

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private readonly stateSubject = new BehaviorSubject<MaintenanceState>(DEFAULT_STATE);
  readonly state$ = this.stateSubject.asObservable();

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    void this.refreshConfig();
  }

  get snapshot(): MaintenanceState {
    return this.stateSubject.value;
  }

  private async refreshConfig(): Promise<void> {
    try {
      const requestUrl = new URL('assets/maintenance-config.json', document.baseURI);
      requestUrl.searchParams.set('ts', `${Date.now()}`);

      const response = await fetch(requestUrl.toString(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Maintenance config request failed: ${response.status}`);
      }

      const config = (await response.json()) as MaintenanceRemoteConfig;
      this.stateSubject.next(this.buildState(config));
      this.scheduleRefresh(config.refreshMs);
    } catch (error) {
      console.error('[maintenance] No se pudo cargar maintenance-config.json', error);
      this.scheduleRefresh();
    }
  }

  private scheduleRefresh(refreshMs: number = DEFAULT_REFRESH_MS): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      void this.refreshConfig();
    }, refreshMs);
  }

  private buildState(config: MaintenanceRemoteConfig): MaintenanceState {
    const version =
      config.version ||
      `${config.banner?.startAt || ''}|${config.banner?.endAt || ''}|${config.overlay?.startAt || ''}|${config.overlay?.endAt || ''}`;

    const bannerShow = this.isDebugEnabled('debugShowBanner') || this.isSectionActive(config.banner);
    const overlayShow = this.isDebugEnabled('debugShowOverlay') || this.isSectionActive(config.overlay);

    return {
      loaded: true,
      version,
      banner: {
        key: `${version}-banner`,
        show: bannerShow,
        title: config.banner?.title || DEFAULT_STATE.banner.title,
        message: config.banner?.message || DEFAULT_STATE.banner.message,
      },
      overlay: {
        key: `${version}-overlay`,
        show: overlayShow,
        title: config.overlay?.title || DEFAULT_STATE.overlay.title,
        subtitle: config.overlay?.subtitle || DEFAULT_STATE.overlay.subtitle,
        statusLabel: config.overlay?.statusLabel || DEFAULT_STATE.overlay.statusLabel,
        statusValue: config.overlay?.statusValue || DEFAULT_STATE.overlay.statusValue,
        resumeLabel: config.overlay?.resumeLabel || DEFAULT_STATE.overlay.resumeLabel,
        resumeValue: config.overlay?.resumeValue || DEFAULT_STATE.overlay.resumeValue,
      },
    };
  }

  private isSectionActive(section?: MaintenanceRemoteSection): boolean {
    if (!section?.enabled) {
      return false;
    }

    const nowMs = Date.now();
    const startMs = this.parseDate(section.startAt);
    const endMs = this.parseDate(section.endAt);

    if (startMs !== null && nowMs < startMs) {
      return false;
    }

    if (endMs !== null && nowMs >= endMs) {
      return false;
    }

    return true;
  }

  private parseDate(value?: string | null): number | null {
    if (!value) {
      return null;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  private isDebugEnabled(storageKey: string): boolean {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  }
}
