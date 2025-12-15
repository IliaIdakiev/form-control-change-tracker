import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import {
  HG_COMPARISON_STRATEGY,
  ComparisonStrategy,
} from './strategies/comparison-strategy';
import { ChangeTrackerContainerDirective } from './change-tracker-container.directive';
import { NgControl } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';

const NOT_SET = Symbol('NOT_SET');

@Directive({
  selector:
    '[ngModel][hgChangeTracker],[formControl][hgChangeTracker],[formControlName][hgChangeTracker]',
  exportAs: 'hgChangeTracker',
  standalone: true,
})
export class ChangeTrackerDirective<T = any> implements OnDestroy, OnInit {
  private _ngControl = inject(NgControl);
  private _strategy = inject(HG_COMPARISON_STRATEGY);
  private _container = inject(ChangeTrackerContainerDirective, {
    optional: true,
  });

  private _changedInitialValue: T | symbol = NOT_SET;
  private _initialValue: T | symbol | undefined = NOT_SET;
  private _previousInitialValue: T | symbol | undefined = NOT_SET;
  private _isAlive$: Subject<void> = new Subject<void>();

  private _shouldForceEmissionOnCheck = false;

  private get _currentValue() {
    const value = this._ngControl ? this._ngControl.value : NOT_SET;
    if (this.type() === 'checkbox') {
      return (this._ngControl as any).viewModel;
    }
    return value;
  }

  get currentValue() {
    return this._currentValue;
  }

  private _destroying = false;
  private _change = new BehaviorSubject<any>(null);

  hasValueChanged = false;

  get name() {
    return this._ngControl?.name;
  }

  readonly type = input<any>(NOT_SET);
  readonly multiInitialValue = input(false, { transform: booleanAttribute });
  readonly autoInitialValueSync = input(true, { transform: booleanAttribute });
  readonly debounceTime = input(20, { transform: numberAttribute });

  @Input() set initialValue(value: any) {
    if (
      this._initialValue === NOT_SET ||
      this.autoInitialValueSync() === true
    ) {
      this._initialValue = value;
      this._scheduleCheck();
      return;
    }
    this._changedInitialValue = value;
    this._scheduleCheck();
  }
  get initialValue() {
    return this._initialValue;
  }

  resetInitialValue(newValue?: T) {
    this._previousInitialValue = this._initialValue;
    const val = arguments.length === 0 ? NOT_SET : newValue;
    this._initialValue = val;
    if (
      this._previousInitialValue !== NOT_SET &&
      this._initialValue === NOT_SET
    ) {
      this._initialValue =
        this._changedInitialValue !== NOT_SET
          ? this._changedInitialValue
          : this._previousInitialValue;
      this._changedInitialValue = NOT_SET;
    }

    this._scheduleCheck();
  }

  get _hasValueChanged() {
    if (this._destroying) {
      return false;
    }

    if (this._initialValue === NOT_SET) {
      return false;
    }

    const initialValue = this._initialValue;
    const currentValue = this._currentValue;
    let areTheSame = false;
    if (Array.isArray(initialValue)) {
      if (this.multiInitialValue() !== false) {
        for (const val of initialValue) {
          areTheSame = this._strategy.isEqual(val, currentValue);
          if (areTheSame) {
            break;
          }
        }
      } else {
        areTheSame = this._strategy.isEqual(initialValue, currentValue);
      }
    } else {
      areTheSame = this._strategy.isEqual(initialValue, currentValue);
    }
    // console.log(`[Check] '${this.name}'. Initial:`, initialValue, 'Current:', currentValue, 'Same:', areTheSame);
    return !areTheSame;
  }

  ngOnDestroy() {
    this._destroying = true;
    if (this._container) {
      this._container.unregister(this);
    }
    this._isAlive$.next();
    this._isAlive$.complete();
  }

  private _checkForChanges() {
    const currentHasChangedValue = this._hasValueChanged;
    if (
      currentHasChangedValue === this.hasValueChanged &&
      this._shouldForceEmissionOnCheck === false
    ) {
      return;
    }
    this._shouldForceEmissionOnCheck = false;
    this.hasValueChanged = currentHasChangedValue;
    if (currentHasChangedValue === true) {
      console.log(
        `[ChangeTracker] Control '${this.name}' hasValueChanged = TRUE. Initial:`,
        this._initialValue,
        'Current:',
        this._currentValue
      );
    } else {
      console.log(
        `[ChangeTracker] Control '${this.name}' hasValueChanged = FALSE.`
      );
    }
    this._change.next(currentHasChangedValue);
  }

  private _scheduleCheck() {
    this._checkForChanges();
    return true;
  }

  get changes() {
    return this._change.asObservable();
  }
  get isAlive$() {
    return this._isAlive$.asObservable();
  }

  ngOnInit(): void {
    if (!this._ngControl.control) {
      return void console.error(
        'Form Control Change Tracker: No ngControl.control found!'
      );
    }

    if (this._container) {
      this._container.register(this);
    }

    if (this._initialValue === NOT_SET) {
      this.resync();
    }

    this._ngControl.control.valueChanges
      .pipe(
        takeUntil(this._isAlive$),
        startWith(null),
        debounceTime(this.debounceTime())
      )
      .subscribe(() => {
        this._shouldForceEmissionOnCheck = true;
        this._scheduleCheck();
      });
  }

  resync(force = false) {
    if (!force && this._initialValue !== NOT_SET && !this._hasValueChanged) {
      return;
    }
    this._initialValue = this.currentValue;
    this._scheduleCheck();
  }
}
