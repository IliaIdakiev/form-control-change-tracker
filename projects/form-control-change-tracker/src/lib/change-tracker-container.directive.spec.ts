import { ChangeTrackerContainerDirective } from './change-tracker-container.directive';
import { Subject } from 'rxjs';

describe('ChangeTrackerContainerDirective', () => {
  let container: ChangeTrackerContainerDirective;
  let tracker1: any;
  let tracker2: any;
  let changes1$: Subject<boolean>;
  let changes2$: Subject<boolean>;
  let isAlive1$: Subject<void>;
  let isAlive2$: Subject<void>;

  function createMockTracker() {
    const changes$ = new Subject<boolean>();
    const isAlive$ = new Subject<void>();
    return {
      changes: changes$.asObservable(),
      changes$,
      isAlive$,
      hasValueChanged: false,
      resync: jasmine.createSpy('resync'),
    };
  }

  beforeEach(() => {
    container = new ChangeTrackerContainerDirective();

    // Mock trackers
    const t1 = createMockTracker();
    tracker1 = t1;
    changes1$ = t1.changes$;
    isAlive1$ = t1.isAlive$;

    const t2 = createMockTracker();
    tracker2 = t2;
    changes2$ = t2.changes$;
    isAlive2$ = t2.isAlive$;
  });

  it('should initially have no changes', () => {
    expect(container.hasChanges).toBeFalse();
  });

  describe('registration', () => {
    it('should update status when tracker registers with changes', () => {
      tracker1.hasValueChanged = true;
      container.register(tracker1);
      expect(container.hasChanges).toBeTrue();
    });

    it('should stay false when tracker registers with no changes', () => {
      tracker1.hasValueChanged = false;
      container.register(tracker1);
      expect(container.hasChanges).toBeFalse();
    });
  });

  describe('tracking updates', () => {
    beforeEach(() => {
      container.register(tracker1);
      container.register(tracker2);
    });

    it('should become true if any tracker emits true', () => {
      expect(container.hasChanges).toBeFalse();

      tracker1.hasValueChanged = true;
      changes1$.next(true);

      expect(container.hasChanges).toBeTrue();
    });

    it('should become false only if ALL trackers are false', () => {
      // Both true
      tracker1.hasValueChanged = true;
      tracker2.hasValueChanged = true;
      changes1$.next(true);
      changes2$.next(true);
      expect(container.hasChanges).toBeTrue();

      // One becomes false
      tracker1.hasValueChanged = false;
      changes1$.next(false);
      expect(container.hasChanges).toBeTrue(); // Still true because of 2

      // Both false
      tracker2.hasValueChanged = false;
      changes2$.next(false);
      expect(container.hasChanges).toBeFalse();
    });
  });

  describe('unregistration', () => {
    it('should re-evaluate changes when a changed tracker unregisters', () => {
      tracker1.hasValueChanged = true;
      container.register(tracker1);
      expect(container.hasChanges).toBeTrue();

      container.unregister(tracker1);
      expect(container.hasChanges).toBeFalse();
    });
  });

  describe('resync', () => {
    it('should call resync on all children', () => {
      container.register(tracker1);
      container.register(tracker2);

      container.resync();

      expect(tracker1.resync).toHaveBeenCalled();
      expect(tracker2.resync).toHaveBeenCalled();
    });
  });
});
