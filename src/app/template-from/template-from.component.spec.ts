import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FormControlChangeTrackerModule } from 'form-control-change-tracker';

import { TemplateFromComponent } from './template-from.component';

describe('TemplateFromComponent', () => {
  let component: TemplateFromComponent;
  let fixture: ComponentFixture<TemplateFromComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, FormControlChangeTrackerModule],
      declarations: [TemplateFromComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
