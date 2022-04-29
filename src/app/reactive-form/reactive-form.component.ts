import { Component, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChangeTrackerDirective, hasChanges } from 'form-control-change-tracker';
import { ChangesWithValues } from 'form-control-change-tracker';

// Creating such interface is optional
interface FormValues {
  firstName: string;
  lastName: string;
  gender: string;
}

@Component({
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
  styleUrls: ['./reactive-form.component.scss']
})
export class ReactiveFormComponent {

  // ChangesWithValues has a default generic of any so you are not obligated creating an interface.
  @ViewChildren(ChangeTrackerDirective) @hasChanges({ includeChangedValues: true }) formChangesData!: ChangesWithValues<FormValues>;
  @ViewChildren(ChangeTrackerDirective) changeTrackers!: QueryList<ChangeTrackerDirective>;
  get hasFormChanges() { return this.formChangesData.hasChanges; }

  unpopulated = true;

  lastNameInitialValues = ['', '123'];

  unpopulatedFormDefaultValues = {
    firstName: '',
    lastName: '',
    gender: null,
    group: {
      test: '1'
    }
  };

  unpopulatedForm = this.fb.group({
    firstName: [this.unpopulatedFormDefaultValues.firstName],
    lastName: [this.unpopulatedFormDefaultValues.lastName],
    gender: [this.unpopulatedFormDefaultValues.gender],
    group: this.fb.group({
      test: [this.unpopulatedFormDefaultValues.group.test]
    })
  });

  populatedFormDefaultValues = {
    firstName: 'Test 1',
    lastName: 'Test 2',
    gender: 'male'
  };

  populatedForm = this.fb.group({
    firstName: [this.populatedFormDefaultValues.firstName],
    lastName: [this.populatedFormDefaultValues.lastName],
    gender: [this.populatedFormDefaultValues.gender]
  });

  constructor(private fb: FormBuilder) { }

  addToInitialValues(value: any) {
    if (this.lastNameInitialValues.includes(value)) { return; }
    this.lastNameInitialValues = this.lastNameInitialValues.concat(value);
  }

  reset() {
    if (this.unpopulated && !!this.unpopulatedForm.get('lastName')) {
      this.addToInitialValues(this.unpopulatedForm.get('lastName')!.value);
      this.unpopulatedFormDefaultValues = this.unpopulatedForm.value;
      return;
    }
    this.populatedFormDefaultValues = this.populatedForm.value;
  }

  submit() {
    alert('Form was submitted!');
  }
}
