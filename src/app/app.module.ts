import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TemplateFromComponent } from './template-from/template-from.component';
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FormControlChangeTrackerModule,
  HG_COMPARISON_STRATEGY,
} from 'form-control-change-tracker';
import { DeepDiffStrategy } from './core/strategies/deep-diff-strategy';

@NgModule({
  declarations: [AppComponent, TemplateFromComponent, ReactiveFormComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormControlChangeTrackerModule,
  ],
  providers: [
    {
      provide: HG_COMPARISON_STRATEGY,
      useClass: DeepDiffStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
