import { Directive, Input, OnDestroy, DoCheck, Optional, ChangeDetectorRef } from '@angular/core';
import { NgModel, FormControl, NgControl } from '@angular/forms';
import { comparer } from './utils/comparer';
import { BehaviorSubject } from 'rxjs';

const NOT_SET = Symbol('NOT_SET');

@Directive({
  selector: '[hgChangeTracker]',
  exportAs: 'hgChangeTracker'
})
export class ChangeTrackerDirective<T = any> implements OnDestroy, DoCheck {

  private _changedInitialValue: T | symbol = NOT_SET;
  private _initialValue: T | symbol = NOT_SET;
  private _previousInitialValue: T | symbol = NOT_SET;

  private get _currentValue() {
    return this.ngModel ? this.ngModel.control.value : this.ngControl ? this.ngControl.value : NOT_SET;
  }

  private _destroying = false;
  private _change = new BehaviorSubject<any>(null);

  hasValueChanged = false;

  @Input() multiInitialValue = false;

  @Input() set initialValue(value: any) {
    if (this._initialValue === NOT_SET) { this._initialValue = value; return; }
    this._changedInitialValue = value;
  }

  resetInitialValue(newValue?: T) {
    this._previousInitialValue = this._initialValue;
    this._initialValue = newValue === undefined ? NOT_SET : newValue;
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
    @Optional() public ngModel: NgModel,
    @Optional() private ngControl: NgControl,
    private cd: ChangeDetectorRef
  ) { }

}
