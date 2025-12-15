import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-reactive-form',
    templateUrl: './reactive-form.component.html',
    styleUrls: ['./reactive-form.component.scss'],
    standalone: false
})
export class ReactiveFormComponent {
  unpopulated = true;

  lastNameInitialValues = ['', '123'];

  unpopulatedFormDefaultValues: any = {
    firstName: '',
    lastName: '',
    gender: null,
    group: {
      test: '1',
    },
  };

  unpopulatedForm = this.fb.group({
    firstName: [this.unpopulatedFormDefaultValues.firstName],
    lastName: [this.unpopulatedFormDefaultValues.lastName],
    gender: [this.unpopulatedFormDefaultValues.gender],
    group: this.fb.group({
      test: [this.unpopulatedFormDefaultValues.group.test],
    }),
  });

  populatedFormDefaultValues: any = {
    firstName: 'Test 1',
    lastName: 'Test 2',
    gender: 'male',
  };

  populatedForm = this.fb.group({
    firstName: [this.populatedFormDefaultValues.firstName],
    lastName: [this.populatedFormDefaultValues.lastName],
    gender: [this.populatedFormDefaultValues.gender],
  });

  constructor(private fb: FormBuilder) {}

  addToInitialValues(value: any) {
    if (this.lastNameInitialValues.includes(value)) {
      return;
    }
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
