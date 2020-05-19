import { Component, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChangeTrackerDirective, hasChanges } from 'form-control-change-tracker';

@Component({
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
  styleUrls: ['./reactive-form.component.scss']
})
export class ReactiveFormComponent {

  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges: boolean;
  @ViewChildren(ChangeTrackerDirective) changeTrackers: QueryList<ChangeTrackerDirective>;

  unpopulated = true;

  lastNameInitialValues = ['', '123'];

  unpopulatedForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    gender: [null]
  });

  populatedForm = this.fb.group({
    firstName: ['Test 1'],
    lastName: ['Test 2'],
    gender: ['male']
  });

  constructor(private fb: FormBuilder) { }

  resetInitialValues() { this.changeTrackers.forEach(i => i.resetInitialValue()); }

  addToInitialValues(value) {
    if (this.lastNameInitialValues.includes(value)) { return; }
    this.lastNameInitialValues = this.lastNameInitialValues.concat(value);
    this.resetInitialValues();
  }

  reset() {
    if (this.unpopulated) { this.addToInitialValues(this.unpopulatedForm.get('lastName').value); }
    this.resetInitialValues();
  }

  submit() {
    alert('Form was submitted!');
  }
}
