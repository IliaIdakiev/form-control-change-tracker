# Angular Form Control Change Tracker

Very often when developers need to know if there were any changes inside the a form in order to present a unsaved changes confirmation dialog when navigating away or in order to disable the save button when there is nothing new to save. The `FormControlChangeTrackerModule` provides two things: 

* The `ChangeTrackerDirective (hgChangeTracker)` that can be set on the individual form controls in order to track if any changes are made 

* And the `@hasChanges()` decorator that is applied over the `ChangeTrackerDirective` directives in order to provide you a boolean value indicating if there are any changes or not.

## Usage:

1. Import the module

your.module.ts
```typescript
@NgModule({
  ...
  imports: [
    ...
    FormControlChangeTrackerModule
  ]
})
export class AppModule { }
```
2. Add the directives and bind the initial value for each one.(the current example is using reactive forms but the module can be used with template driven forms as well. [Check out the demo app](https://stackblitz.com/github/IliaIdakiev/form-control-change-tracker))

your.component.html
```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <div class="form-group">
    <label>First Name</label>
    <input type="text" name="firstName" formControlName="firstName" hgChangeTracker
      [initialValue]="firstNameDefaultValue" />
  </div>
  <div class="form-group">
    <label>Last Name</label>
    <input type="text" name="lastName" formControlName="lastName" hgChangeTracker
      [initialValue]="lastNameDefaultValue" />
  </div>
  <button [disabled]="!hasFormChanges">Submit</button>
</form>
```

3. Get the `hasFormChanges` value

your.component.ts
```typescript
@Component({
  ...
})
export class TemplateFromComponent {

  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges: boolean;

  ...

}
```

**[Check out the demo app](https://stackblitz.com/github/IliaIdakiev/form-control-change-tracker)**

4. More configurations

### Decorator configuration

your.component.ts
```typescript
@Component({
  ...
})
export class TemplateFromComponent {

  // ChangesWithValues<T> { hasChanges: boolean; values: { [P in keyof T]: { current: T[P]; initial: T[P]; }; }; } (very useful for debugging)
  @ViewChildren(ChangeTrackerDirective) @hasChanges({ includeChangedValues: true }) formChangesData: ChangesWithValues<T>;
  ...
}
```

### Inputs

change-tracker.directive
```typescript 
@Directive({
  selector: '[ngModel][hgChangeTracker],[formControl][hgChangeTracker],[formControlName][hgChangeTracker]',
  exportAs: 'hgChangeTracker'
})
export class ChangeTrackerDirective {

  @Input() multiInitialValue = false; // used for multiple initial values
  @Input() autoInitialValueSync = true; // it can be used to disable the auto syncing of initialValue input

  // whenever the auto sync is disabled this method needs to be manually called in order for the new initial value to be set
  // keep in mind that the newValue is optional and if omitted the last change of the initialValue binding will be the new initial value
  resetInitialValue(newValue?: T) { ... }
}
```