import { Directive, Input, OnDestroy, DoCheck } from '@angular/core';
import { NgModel } from '@angular/forms';
import { comparer } from './utils/comparer';
import { BehaviorSubject } from 'rxjs';

const NOT_SET = Symbol('NOT_SET');

@Directive({
  selector: '[hgChangeTracker]',
  exportAs: 'hgChangeTracker'
})
export class ChangeTrackerDirective implements OnDestroy, DoCheck {

  private _initialValue = NOT_SET;
  private _currentInitialValue = NOT_SET;
  private _currentValue = NOT_SET;
  private _shouldResetValue = false;
  private _destroying = false;
  private _change = new BehaviorSubject<any>(null);


  hasValueChanged = false;

  @Input() multipleInitialValue = false;
  @Input() lazyReset = false;

  @Input() set initialValue(value: any) {
    this._currentInitialValue = value;
    if (this._initialValue === NOT_SET || this._shouldResetValue) {
      this._initialValue = value;
      this._shouldResetValue = false;
    } else if (!this.lazyReset) {
      console.warn(`[ifHasValueChanged]: You are trying to change initial value without resetting directive!` +
        ` (this can also mean that you might need a resolver to skip default property value) ` +
        `Current Value: ${JSON.stringify(this._initialValue)} New Value: ${JSON.stringify(value)}`);
    }
  }

  reset() {
    this._initialValue = this._currentInitialValue;
    this._shouldResetValue = true;
  }


  get _hasValueChanged() {
    if (this._destroying) {
      return false;
    }

    const initialValue = this._initialValue !== NOT_SET ? this._initialValue : this._currentValue;
    let areTheSame = false;
    if (Array.isArray(initialValue)) {
      if (this.multipleInitialValue) {
        for (const val of initialValue) {
          areTheSame = comparer(val, this.ngModel.viewModel);
          if (areTheSame) { break; }
        }
      } else {
        areTheSame = comparer(initialValue, this.ngModel.viewModel);
      }
    } else {
      areTheSame = comparer(initialValue, this.ngModel.viewModel);
    }
    return !areTheSame;
  }

  ngOnDestroy() {
    this._destroying = true;
  }

  ngDoCheck() {
    this._currentValue = this.ngModel.model;
    this._shouldResetValue = false;
    const currentValue = this._hasValueChanged;
    if (currentValue !== this.hasValueChanged) {
      this.hasValueChanged = currentValue;
      this._change.next(currentValue);
    }
  }

  constructor(public ngModel: NgModel) { }

}
