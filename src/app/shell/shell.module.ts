import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { I18nModule } from '@app/i18n';
import { MaterialModule } from '@app/material.module';
import { SharedModule } from '@shared';
import { ShellComponent } from './shell.component';
import { MaintenanceBannerComponent } from './maintenance-banner/maintenance-banner.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule,
    SharedModule,
    I18nModule,
    RouterModule,
  ],
  declarations: [ShellComponent, MaintenanceBannerComponent],
  exports: [MaintenanceBannerComponent],
})
export class ShellModule {}
