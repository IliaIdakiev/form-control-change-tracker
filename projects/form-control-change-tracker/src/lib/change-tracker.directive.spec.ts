import { ChangeTrackerDirective } from './change-tracker.directive';
import { FormControl, NgControl } from '@angular/forms';

import { of, Subject } from 'rxjs';
import { ChangeTrackerContainerDirective } from './change-tracker-container.directive';
import {
  fakeAsync,
  tick,
  discardPeriodicTasks,
  flush,
} from '@angular/core/testing';
import { SimpleStrategy } from './strategies/simple-strategy';

describe('ChangeTrackerDirective', () => {
  let directive: ChangeTrackerDirective;
  let ngControlMock: any;
  let containerMock: any;
  let strategy: SimpleStrategy;
  let valueChanges$: Subject<any>;
  let currentMockValue = 'initial';

  beforeEach(() => {
    currentMockValue = 'initial';
    strategy = new SimpleStrategy();
    valueChanges$ = new Subject<any>();

    ngControlMock = {
      control: {
        valueChanges: valueChanges$.asObservable(),
        get value() {
          return currentMockValue;
        },
      },
      get value() {
        return currentMockValue;
      },
    };

    containerMock = {
      register: jasmine.createSpy('register'),
      unregister: jasmine.createSpy('unregister'),
    };

    directive = new ChangeTrackerDirective(
      ngControlMock,
      strategy,
      containerMock
    );
    directive.debounceTime = 0;
  });

  describe('initialization', () => {
    it('should register with container if present', () => {
      directive.ngOnInit();
      expect(containerMock.register).toHaveBeenCalledWith(directive);
    });

    it('should auto-capture initial value if not set', () => {
      directive.ngOnInit();
      expect(directive.initialValue).toBe('initial');
    });

    it('should NOT auto-capture if initial value is set by input', () => {
      directive.initialValue = 'custom-initial';
      directive.ngOnInit();
      expect(directive.initialValue).toBe('custom-initial');
    });

    it('should update initialValue if autoInitialValueSync is true', () => {
      // Default autoInitialValueSync is true
      directive.initialValue = 'first';
      directive.initialValue = 'second';
      expect(directive.initialValue).toBe('second');
    });

    it('should NOT update initialValue immediately if autoInitialValueSync is false', () => {
      directive.autoInitialValueSync = false;
      directive.initialValue = 'first';
      directive.initialValue = 'second';
      // Should remain 'first' because sync is disabled
      expect(directive.initialValue).toBe('first');

      // But it stores it in _changedInitialValue and updates on ngDoCheck if previous was NOT_SET?
      // Actually code says: if (_initialValue === NOT_SET || autoSync === true) set it.
      // Else set _changedInitialValue.
      // ngDoCheck logic is: if (_previousInitialValue !== NOT_SET && _initialValue === NOT_SET) ...
      // This logic seems specific to some delayed initialization.
    });
  });

  describe('change detection', () => {
    // beforeEach(() => {
    //   directive.ngOnInit();
    // });

    it('should detect no changes initially', fakeAsync(() => {
      directive.ngOnInit();
      valueChanges$.next('initial');
      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeFalse();
      discardPeriodicTasks();
    }));

    it('should detect changes when value differs', fakeAsync(() => {
      directive.ngOnInit();
      // simulate value change
      currentMockValue = 'new-value';

      // Emit trigger
      valueChanges$.next('new-value');

      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeTrue();
      discardPeriodicTasks();
    }));

    it('should revert to no changes when value returns to initial', fakeAsync(() => {
      directive.ngOnInit();
      currentMockValue = 'new-value';
      valueChanges$.next('new-value');
      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeTrue();

      currentMockValue = 'initial';

      valueChanges$.next('initial');
      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeFalse();
      discardPeriodicTasks();
    }));
  });

  describe('resync', () => {
    it('should update initial value to current value', () => {
      directive.ngOnInit();
      expect(directive.initialValue).toBe('initial');

      // Change value
      currentMockValue = 'new-value';
      directive.resync(); // Capture 'new-value' as initial

      expect(directive.initialValue).toBe('new-value');
    });

    it('should unset initialValue if called with no arguments', () => {
      directive.ngOnInit();
      directive.resetInitialValue();
      expect(directive.hasValueChanged).toBeFalse();
    });

    it('should restore previous initial value immediately if reset to empty (logic moved from ngDoCheck)', () => {
      directive.initialValue = 'old';
      directive.ngOnInit();

      // Reset to empty (NOT_SET)
      // The new logic in resetInitialValue handles the restoration immediately
      directive.resetInitialValue();

      // Should have restored 'old' because _changedInitialValue was NOT_SET
      expect(directive.initialValue).toBe('old');
    });
  });

  describe('destruction', () => {
    it('should unregister from container', () => {
      directive.ngOnInit(); // registers
      directive.ngOnDestroy();
      expect(containerMock.unregister).toHaveBeenCalledWith(directive);
    });
  });

  describe('multiInitialValue', () => {
    it('should NOT be changed if currentValue matches one of the initial values', fakeAsync(() => {
      directive.multiInitialValue = true;
      directive.initialValue = ['initial', 'alternate'];
      directive.ngOnInit();

      currentMockValue = 'alternate';
      valueChanges$.next('alternate');
      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeFalse();
      discardPeriodicTasks();
    }));

    it('should be changed if currentValue matches NONE of the initial values', fakeAsync(() => {
      directive.multiInitialValue = true;
      directive.initialValue = ['initial', 'alternate'];
      directive.ngOnInit();

      currentMockValue = 'other';
      valueChanges$.next('other');
      tick(100);
      flush();

      expect(directive.hasValueChanged).toBeTrue();
      discardPeriodicTasks();
    }));
  });
});
