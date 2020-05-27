import { QueryList } from '@angular/core';
import { ChangeTrackerDirective } from './change-tracker.directive';
import { combineLatest, Subject, asyncScheduler, asapScheduler, Subscription } from 'rxjs';
import { takeUntil, observeOn } from 'rxjs/operators';
import { NgControl } from '@angular/forms';

const _items = Symbol('items');
const _configureWatch = Symbol('configureWatch');
const _hasChanges = Symbol('hasChanges');
const _isAlive = Symbol('isAlive');
const _isViewReady = Symbol('isViewReady');
const _isConfigureWatchScheduled = Symbol('isViewReady');
const _watchSubscription = Symbol('watchSubscription');
const _isInitialized = Symbol('isInitialized');

function getDefaultValueForConfig(config?: { includeChangedValues: boolean }) {
  return config && config.includeChangedValues ? { hasChanges: false, values: {} } : false;
}

export function hasChanges(config?: { includeChangedValues: boolean }) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      set(items: QueryList<ChangeTrackerDirective>) {
        if (this[_items] === items) { return; }
        this[_isViewReady] = false;
        this[_isAlive] = new Subject();
        this[_items] = items;
        this[_configureWatch] = function () {
          if (this[_isConfigureWatchScheduled]) { return; }
          this[_isConfigureWatchScheduled] = true;
          asapScheduler.schedule(() => {
            this[_isConfigureWatchScheduled] = false;
            const currentItems = this[_items] as QueryList<ChangeTrackerDirective>;
            const changeStreams = currentItems.map(i => ((i as any)._change as Subject<any>));

            if (this[_watchSubscription]) {
              (this[_watchSubscription] as Subscription).unsubscribe();
              (this[_watchSubscription] as Subscription) = undefined;
            }

            this[_watchSubscription] = combineLatest(changeStreams).pipe(
              takeUntil(this[_isAlive]), observeOn(asyncScheduler)
            ).subscribe((newValue) => {
              if (config && config.includeChangedValues) {
                const _hasChangesValue = this[_hasChanges] || getDefaultValueForConfig(config);
                _hasChangesValue.hasChanges = newValue.includes(true);
                _hasChangesValue.values = currentItems.reduce((acc, curr) => {
                  const ngControl: NgControl = (curr as any).ngControl;
                  ngControl.path.reduce((pathAcc, currPath, index, arr) => {
                    if (arr.length - 1 === index) {
                      return pathAcc[currPath] = { initial: curr.initialValue, current: curr.currentValue };
                    }
                    return pathAcc[currPath] = pathAcc[currPath] || {};
                  }, acc);

                  return acc;
                }, _hasChangesValue.values);
                return;
              }
              this[_hasChanges] = newValue.includes(true);
            });
          });
        };

        items.changes.pipe(takeUntil(this[_isAlive])).subscribe((newItems: QueryList<ChangeTrackerDirective>) => {
          this[_items] = newItems;
          if (!this[_isViewReady]) { return; }
          this[_configureWatch]();
        });
      },
      get() {
        if (this[_hasChanges] === undefined) { this[_hasChanges] = getDefaultValueForConfig(config); }
        return this[_hasChanges];
      }
    });

    if (target[_isInitialized]) { return; }
    target[_isInitialized] = true;

    const _originalNgAfterViewInit = target.constructor.ɵcmp.afterViewInit;
    const _ngAfterViewInit: any = function () {
      this[_isViewReady] = true;
      this[_configureWatch]();

      if (_originalNgAfterViewInit) {
        _originalNgAfterViewInit.call(this);
      }
    };


    const _originalNgOnDestroy = target.constructor.ɵcmp.onDestroy;
    const _ngOnDestroy: any = function () {
      (this[_isAlive] as Subject<void>).next();
      (this[_isAlive] as Subject<void>).complete();
      if (_originalNgOnDestroy) {
        _originalNgOnDestroy.call(this);
      }
    };

    target.constructor.ɵcmp.afterViewInit = _ngAfterViewInit;
    target.constructor.ɵcmp.onDestroy = _ngOnDestroy;

  };
}
