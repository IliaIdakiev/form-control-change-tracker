import { NgModule } from '@angular/core';
import { ChangeTrackerDirective } from './change-tracker.directive';
import { HG_COMPARISON_STRATEGY } from './strategies/comparison-strategy';
import { SimpleStrategy } from './strategies/simple-strategy';

import { ChangeTrackerContainerDirective } from './change-tracker-container.directive';

@NgModule({
  declarations: [ChangeTrackerDirective, ChangeTrackerContainerDirective],
  imports: [],
  exports: [ChangeTrackerDirective, ChangeTrackerContainerDirective],
  providers: [
    {
      provide: HG_COMPARISON_STRATEGY,
      useClass: SimpleStrategy,
    },
  ],
})
export class FormControlChangeTrackerModule {}
