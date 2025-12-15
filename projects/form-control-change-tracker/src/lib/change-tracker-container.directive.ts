import { Directive, OnDestroy, AfterContentInit } from '@angular/core';
import { ChangeTrackerDirective } from './change-tracker.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[hgChangeTrackerContainer]',
  exportAs: 'hgChangeTrackerContainer',
})
export class ChangeTrackerContainerDirective
  implements AfterContentInit, OnDestroy
{
  private _trackers = new Set<ChangeTrackerDirective>();
  private _isAlive = new Subject<void>();

  hasChanges = false;
  hasChanges$ = new Subject<boolean>();

  register(tracker: ChangeTrackerDirective) {
    this._trackers.add(tracker);
    this._listenToTracker(tracker);
    this._updateHasChanges();
  }

  unregister(tracker: ChangeTrackerDirective) {
    this._trackers.delete(tracker);
    this._updateHasChanges();
  }

  resync() {
    this._trackers.forEach((tracker) => tracker.resync());
  }

  private _listenToTracker(tracker: ChangeTrackerDirective) {
    tracker.changes
      .pipe(takeUntil(this._isAlive), takeUntil(tracker.isAlive$))
      .subscribe(() => {
        this._updateHasChanges();
      });
  }

  private _updateHasChanges() {
    let hasChanges = false;
    for (const tracker of this._trackers) {
      if (tracker.hasValueChanged) {
        hasChanges = true;
        break;
      }
    }
    if (this.hasChanges !== hasChanges) {
      this.hasChanges = hasChanges;
      this.hasChanges$.next(hasChanges);
    }
  }

  ngAfterContentInit() {}

  ngOnDestroy() {
    this._isAlive.next();
    this._isAlive.complete();
  }
}
