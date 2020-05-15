import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { hasChanges, ChangeTrackerDirective } from 'form-control-change-tracker';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-template-from',
  templateUrl: './template-from.component.html',
  styleUrls: ['./template-from.component.scss']
})
export class TemplateFromComponent implements OnInit {

  unpopulated = true;

  unpopulatedDummyData = {
    firstName: '',
    lastName: ''
  };

  populatedDummyData = {
    firstName: 'Test 1',
    lastName: 'Test 2'
  };

  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges: boolean;
  @ViewChildren(ChangeTrackerDirective) changeTrackers: QueryList<ChangeTrackerDirective>;
  @ViewChild(NgForm) form: NgForm;

  constructor() { }

  ngOnInit(): void {
  }

  reset() {
    if (this.unpopulated) {
      this.unpopulatedDummyData = this.form.value;
    } else {
      this.populatedDummyData = this.form.value;
    }
    this.changeTrackers.forEach(t => t.reset());
  }
}
