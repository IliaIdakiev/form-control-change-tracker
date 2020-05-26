import { Directive, Input, OnDestroy, DoCheck, Optional, ChangeDetectorRef } from '@angular/core';
import { NgModel, FormControl, NgControl } from '@angular/forms';
import { comparer } from './utils/comparer';
import { BehaviorSubject } from 'rxjs';

const NOT_SET = Symbol('NOT_SET');

@Directive({
  selector: '[ngModel][hgChangeTracker],[formControl][hgChangeTracker],[formControlName][hgChangeTracker]',
  exportAs: 'hgChangeTracker'
})
export class ChangeTrackerDirective<T = any> implements OnDestroy, DoCheck {

  private _changedInitialValue: T | symbol = NOT_SET;
  private _initialValue: T | symbol = NOT_SET;
  private _previousInitialValue: T | symbol = NOT_SET;

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
    if (this._initialValue === NOT_SET || this.autoInitialValueSync === true) { this._initialValue = value; return; }
    this._changedInitialValue = value;
  }
  get initialValue() { return this._initialValue; }

  resetInitialValue(newValue?: T) {
    this._previousInitialValue = this._initialValue;
    this._initialValue = arguments.length === 0 ? NOT_SET : newValue;
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
  }

  ngDoCheck() {
    if (this._previousInitialValue !== NOT_SET && this._initialValue === NOT_SET) {
      this._initialValue = this._changedInitialValue !== NOT_SET ? this._changedInitialValue : this._previousInitialValue;
      this._changedInitialValue = NOT_SET;
    }
    const currentHasValueChanged = this._hasValueChanged;
    if (currentHasValueChanged !== this.hasValueChanged) {
      this.hasValueChanged = currentHasValueChanged;
      this._change.next(currentHasValueChanged);
    }
  }

  constructor(
    @Optional() private ngControl: NgControl
  ) { }
}
