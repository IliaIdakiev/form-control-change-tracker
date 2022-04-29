import { Directive, Input, OnDestroy, DoCheck, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { comparer } from './utils/comparer';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';

const NOT_SET = Symbol('NOT_SET');

@Directive({
  selector: '[ngModel][hgChangeTracker],[formControl][hgChangeTracker],[formControlName][hgChangeTracker]',
  exportAs: 'hgChangeTracker'
})
export class ChangeTrackerDirective<T = any> implements OnDestroy, DoCheck, OnInit {

  private _changedInitialValue: T | symbol = NOT_SET;
  private _initialValue: T | symbol | undefined = NOT_SET;
  private _previousInitialValue: T | symbol | undefined = NOT_SET;
  private _isAlive$: Subject<void> = new Subject<void>();
  private _isCheckScheduled = false;
  private _shouldForceEmissionOnCheck = false;

  private get _currentValue() {
    const value = this.ngControl ? this.ngControl.value : NOT_SET;
    if (this.type === 'checkbox') {
      return (this.ngControl as any).viewModel;
    }
    return value;
  }

  get currentValue() { return this._currentValue; }

  private _destroying = false;
  private _change = new BehaviorSubject<any>(null);

  hasValueChanged = false;

  @Input() type: any = NOT_SET;
  @Input() multiInitialValue = false;
  @Input() autoInitialValueSync = true;

  @Input() set initialValue(value: any) {
    this._scheduleCheck();
    if (this._initialValue === NOT_SET || this.autoInitialValueSync === true) { this._initialValue = value; return; }
    this._changedInitialValue = value;
  }
  get initialValue() { return this._initialValue; }

  resetInitialValue(newValue?: T) {
    this._previousInitialValue = this._initialValue;
    this._initialValue = arguments.length === 0 ? NOT_SET : newValue;
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
      if (this.multiInitialValue !== false) {
        for (const val of initialValue) {
          areTheSame = comparer(val, currentValue);
          if (areTheSame) { break; }
        }
      } else {
        areTheSame = comparer(initialValue, currentValue);
      }
    } else {
      areTheSame = comparer(initialValue, currentValue);
    }
    return !areTheSame;
  }

  ngOnDestroy() {
    this._destroying = true;
    this._isAlive$.next();
    this._isAlive$.complete();
  }

  ngDoCheck() {
    if (this._previousInitialValue !== NOT_SET && this._initialValue === NOT_SET) {
      this._initialValue = this._changedInitialValue !== NOT_SET ? this._changedInitialValue : this._previousInitialValue;
      this._changedInitialValue = NOT_SET;
      this._scheduleCheck();
    }
  }

  private _checkForChanges() {
    const currentHasChangedValue = this._hasValueChanged;
    if (currentHasChangedValue === this.hasValueChanged && this._shouldForceEmissionOnCheck === false) { return; }
    this._shouldForceEmissionOnCheck = false;
    this.hasValueChanged = currentHasChangedValue;
    this._change.next(currentHasChangedValue);
  }

  private _scheduleCheck() {
    if (this._isCheckScheduled) { return false; }
    this._isCheckScheduled = true;
    Promise.resolve().then(() => {
      this._isCheckScheduled = false;
      this._checkForChanges();
    });
    return true;
  }

  constructor(private ngControl: NgControl) { }

  ngOnInit(): void {
    if (!this.ngControl.control) {
      return void console.error('Form Control Change Tracker: No ngControl.control found!');;
    }

    this.ngControl.control.valueChanges.pipe(takeUntil(this._isAlive$), startWith(null)).subscribe(() => {
      this._shouldForceEmissionOnCheck = true;
      this._scheduleCheck();
    });
  }
}
