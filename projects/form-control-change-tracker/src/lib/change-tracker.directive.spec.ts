import { ChangeTrackerDirective } from './change-tracker.directive';
import { NgControl, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ChangeTrackerContainerDirective } from './change-tracker-container.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleStrategy } from './strategies/simple-strategy';
import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { HG_COMPARISON_STRATEGY } from './strategies/comparison-strategy';

@Component({
  template: `
    <input
      hgChangeTracker
      [formControl]="control"
      [debounceTime]="debounceTime"
      [multiInitialValue]="multiInitialValue"
      [autoInitialValueSync]="autoInitialValueSync"
    />
  `,
  standalone: true,
  imports: [ChangeTrackerDirective, ReactiveFormsModule],
})
class TestHostComponent {
  @ViewChild(ChangeTrackerDirective) directive!: ChangeTrackerDirective;
  control: any;
  debounceTime = 0;
  multiInitialValue = false;
  autoInitialValueSync = true;
}

describe('ChangeTrackerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let directive: ChangeTrackerDirective;
  let ngControlMock: any;
  let containerMock: any;
  let valueChanges$: Subject<any>;
  let currentMockValue = 'initial';

  beforeEach(async () => {
    currentMockValue = 'initial';
    valueChanges$ = new Subject<any>();

    const realControl = new FormControl('initial');
    ngControlMock = {
      control: realControl,
      value: 'initial',
      get valueChanges() {
        return realControl.valueChanges;
      },
    };

    containerMock = {
      register: jasmine.createSpy('register'),
      unregister: jasmine.createSpy('unregister'),
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ChangeTrackerDirective],
      providers: [
        { provide: HG_COMPARISON_STRATEGY, useClass: SimpleStrategy },
        { provide: ChangeTrackerContainerDirective, useValue: containerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.control = realControl;
    fixture.detectChanges();
    directive = hostComponent.directive;

    valueChanges$ = new Subject();
  });

  describe('initialization', () => {
    it('should register with container if present', () => {
      expect(containerMock.register).toHaveBeenCalled(); // Called during detectChanges in beforeEach
    });

    it('should auto-capture initial value if not set', () => {
      expect(directive.initialValue).toBe('initial');
    });

    it('should NOT auto-capture if initial value is set by setter (simulated)', () => {
      // Direct setter access for 'initialValue' input which is still a setter
      directive.initialValue = 'custom-initial';
      directive.ngOnInit(); // Re-trigger init logic if needed, or just check state
      expect(directive.initialValue).toBe('custom-initial');
    });

    it('should update initialValue if autoInitialValueSync is true', () => {
      directive.initialValue = 'first';
      directive.initialValue = 'second';
      expect(directive.initialValue).toBe('second');
    });

    it('should NOT update initialValue immediately if autoInitialValueSync is false', () => {
      hostComponent.autoInitialValueSync = false;
      fixture.detectChanges();

      directive.initialValue = 'first';
      directive.initialValue = 'second';
      // Should remain 'initial' (from init) because sync is disabled and it was already set
      expect(directive.initialValue).toBe('initial');
    });
  });

  describe('change detection', () => {
    it('should detect no changes initially', () => {
      expect(directive.hasValueChanged).toBeFalse();
    });

    it('should detect changes when value differs', (done) => {
      hostComponent.control.setValue('new-value');
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges(); // Ensure view is updated if needed
        try {
          expect(directive.hasValueChanged).toBeTrue();
          done();
        } catch (e) {
          done.fail(e as any);
        }
      }, 50); // > 20ms debounce
    });

    it('should revert to no changes when value returns to initial', (done) => {
      hostComponent.control.setValue('new-value');
      fixture.detectChanges();

      setTimeout(() => {
        expect(directive.hasValueChanged).toBeTrue();

        hostComponent.control.setValue('initial');
        fixture.detectChanges();

        setTimeout(() => {
          try {
            expect(directive.hasValueChanged).toBeFalse();
            done();
          } catch (e) {
            done.fail(e as any);
          }
        }, 50);
      }, 50);
    });
  });

  describe('resync', () => {
    it('should update initial value to current value', () => {
      expect(directive.initialValue).toBe('initial');

      // Change value
      hostComponent.control.setValue('new-value');
      // tick/flush? resync is synchronous usually?
      // Direct call
      directive.resync();

      expect(directive.initialValue).toBe('new-value');
      expect(directive.hasValueChanged).toBeFalse();
    });

    it('should unset initialValue if called with no arguments', () => {
      directive.resetInitialValue();
      expect(directive.hasValueChanged).toBeFalse();
    });
  });

  describe('destruction', () => {
    it('should unregister from container', () => {
      fixture.destroy();
      expect(containerMock.unregister).toHaveBeenCalled();
    });
  });

  describe('multiInitialValue', () => {
    it('should NOT be changed if currentValue matches one of the initial values', (done) => {
      hostComponent.multiInitialValue = true;
      fixture.detectChanges();

      directive.initialValue = ['initial', 'alternate'];

      hostComponent.control.setValue('alternate');
      fixture.detectChanges();

      setTimeout(() => {
        try {
          expect(directive.hasValueChanged).toBeFalse();
          done();
        } catch (e) {
          done.fail(e as any);
        }
      }, 50);
    });

    it('should be changed if currentValue matches NONE of the initial values', (done) => {
      hostComponent.multiInitialValue = true;
      fixture.detectChanges();

      directive.initialValue = ['initial', 'alternate'];

      hostComponent.control.setValue('other');
      fixture.detectChanges();

      setTimeout(() => {
        try {
          expect(directive.hasValueChanged).toBeTrue();
          done();
        } catch (e) {
          done.fail(e as any);
        }
      }, 50);
    });
    it('should reset changes when resync is called even with multiInitialValue', (done) => {
      hostComponent.multiInitialValue = true;
      fixture.detectChanges();

      directive.initialValue = ['initial', 'alternate']; // Array initial
      hostComponent.control.setValue('other'); // Change to new value
      fixture.detectChanges();

      setTimeout(() => {
        expect(directive.hasValueChanged).toBeTrue();

        directive.resync(); // Should set initialValue to 'other' (string)

        expect(directive.initialValue).toBe('other');
        expect(directive.hasValueChanged).toBeFalse();
        done();
      }, 50);
    });

    it('should NOT update initialValue on resync if control is clean (preserving multi-initial values)', (done) => {
      hostComponent.multiInitialValue = true;
      fixture.detectChanges();

      const multiValues = ['initial', 'alternate'];
      directive.initialValue = multiValues;

      // Control is 'initial', which is in multiValues, so it's clean.
      expect(directive.hasValueChanged).toBeFalse();

      // Call resync.
      // BEFORE FIX: sets initialValue = 'initial'
      // AFTER FIX: leaves initialValue = ['initial', 'alternate']
      directive.resync();

      // Change to the other valid value
      hostComponent.control.setValue('alternate');
      fixture.detectChanges();

      setTimeout(() => {
        try {
          // If bug exists, this will be true (dirty).
          // If fixed, this will be false (clean).
          expect(directive.hasValueChanged).toBeFalse();
          done();
        } catch (e) {
          done.fail(e as any);
        }
      }, 50);
    });
  });
});

describe('ChangeTrackerDirective - Multi-Control Resync Scenario', () => {
  @Component({
    template: `
      <input
        name="firstName"
        hgChangeTracker
        [formControl]="firstNameControl"
        [initialValue]="firstNameInitial"
        [debounceTime]="0"
      />
      <input
        name="lastName"
        hgChangeTracker
        [formControl]="lastNameControl"
        [initialValue]="lastNameInitial"
        [multiInitialValue]="true"
        [debounceTime]="0"
      />
    `,
    standalone: true,
    imports: [ChangeTrackerDirective, ReactiveFormsModule],
  })
  class MultiControlComponent {
    @ViewChildren(ChangeTrackerDirective)
    trackers!: QueryList<ChangeTrackerDirective>;
    firstNameControl = new FormControl('');
    lastNameControl = new FormControl('');
    firstNameInitial = '';
    lastNameInitial = ['', '123'];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiControlComponent],
      providers: [
        { provide: HG_COMPARISON_STRATEGY, useClass: SimpleStrategy },
      ],
    }).compileComponents();
  });

  it('should preserve lastName multiInitialValue after resync on all controls', (done) => {
    const fixture = TestBed.createComponent(MultiControlComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Step 1: Set firstName to "123"
    component.firstNameControl.setValue('123');
    fixture.detectChanges();

    setTimeout(() => {
      // Step 2: Simulate "Set current data as default" button
      // This updates the initial values
      component.firstNameInitial = '123';
      component.lastNameInitial = ['', '123']; // Add '123' to valid values

      // DO NOT call detectChanges here - simulate the component's setTimeout(0) behavior

      // Call resync on all trackers (simulating the component's reset() method)
      setTimeout(() => {
        component.trackers.forEach((t: ChangeTrackerDirective) =>
          t.resync(true)
        );

        // Step 3: Set lastName to "123"
        component.lastNameControl.setValue('123');
        fixture.detectChanges();

        setTimeout(() => {
          const lastNameTracker = component.trackers.toArray()[1];

          console.log('LastName tracker state:', {
            initialValue: lastNameTracker.initialValue,
            currentValue: lastNameTracker.currentValue,
            hasValueChanged: lastNameTracker.hasValueChanged,
          });

          // This should be FALSE because '123' is in the multiInitialValue array
          expect(lastNameTracker.hasValueChanged).toBeFalse();
          done();
        }, 50);
      }, 0);
    }, 50);
  });
});
