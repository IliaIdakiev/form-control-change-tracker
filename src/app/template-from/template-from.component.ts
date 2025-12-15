import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import {
  hasChanges,
  ChangeTrackerDirective,
} from 'form-control-change-tracker';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-template-from',
  templateUrl: './template-from.component.html',
  styleUrls: ['./template-from.component.scss'],
  standalone: false,
})
export class TemplateFromComponent {
  unpopulated = true;

  unpopulatedDummyData = {
    firstName: '',
    lastName: '',
    gender: null,
  };

  populatedDummyData = {
    firstName: 'Test 1',
    lastName: 'Test 2',
  };

  lastNameInitialValues = ['', '123'];

  immutableObject = { a: 1, b: 2 };
  initialImmutableObject = { b: 2, a: 1 };

  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges!: boolean;
  @ViewChildren(ChangeTrackerDirective)
  changeTrackers!: QueryList<ChangeTrackerDirective>;
  @ViewChild(NgForm) form!: NgForm;

  constructor(private cdr: ChangeDetectorRef) {}

  addToInitialValues(value: any) {
    if (this.lastNameInitialValues.includes(value)) {
      return;
    }
    this.lastNameInitialValues = this.lastNameInitialValues.concat(value);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    console.log(1323);
  }

  reset() {
    if (this.unpopulated) {
      this.unpopulatedDummyData = this.form.value;
      this.addToInitialValues(this.unpopulatedDummyData.lastName);
      this.initialImmutableObject = this.immutableObject;
    } else {
      this.populatedDummyData = this.form.value;
    }
    // Trigger change detection to ensure bindings update
    this.cdr.detectChanges();
    // Wait for bindings to fully propagate, then force resync
    setTimeout(() => {
      this.changeTrackers.forEach((t) => t.resync(true));
    }, 10);
  }

  get dirtyControlNames() {
    return this.changeTrackers
      ? this.changeTrackers.filter((t) => t.hasValueChanged).map((t) => t.name)
      : [];
  }

  submit() {
    alert('Form was submitted!');
  }
}
