# Angular Form Control Change Tracker

[![npm version](https://img.shields.io/npm/v/form-control-change-tracker.svg)](https://www.npmjs.com/package/form-control-change-tracker)
[![npm downloads](https://img.shields.io/npm/dm/form-control-change-tracker.svg)](https://www.npmjs.com/package/form-control-change-tracker)
[![License](https://img.shields.io/npm/l/form-control-change-tracker.svg)](https://www.npmjs.com/package/form-control-change-tracker)
![Angular](https://img.shields.io/badge/Angular-15+-dd0031.svg)
[![CI](https://github.com/IliaIdakiev/form-control-change-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/IliaIdakiev/form-control-change-tracker/actions/workflows/ci.yml)

## Version Compatibility

| Angular Version | Library Version | Status            |
| :-------------- | :-------------- | :---------------- |
| **v19+**        | `^1.0.0`        | 🟢 Stable         |
| **v15 - v19**   | `0.0.4`         | 🟡 Legacy Support |

### Custom Comparison Strategy

The library uses a `SimpleStrategy` by default, which performs a fast reference check for primitives and a **key-order independent** deep comparison for objects. To use a different strategy (e.g., `deep-diff`):

1.  **Install `deep-diff`** (or your preferred library):

    ```bash
    npm install deep-diff
    npm install @types/deep-diff --save-dev
    ```

2.  **Create the Strategy**:

    ```typescript
    import { Injectable } from "@angular/core";
    import { ComparisonStrategy } from "form-control-change-tracker";
    import { diff } from "deep-diff";

    @Injectable()
    export class DeepDiffStrategy implements ComparisonStrategy {
      isEqual(a: any, b: any): boolean {
        // Returns true if no differences found
        return !diff(a, b);
      }
    }
    ```

3.  **Provide it in your Module**:

    ```typescript
    import { HG_COMPARISON_STRATEGY } from "form-control-change-tracker";
    import { DeepDiffStrategy } from "./strategies/deep-diff-strategy";

    @NgModule({
      // ...
      providers: [
        {
          provide: HG_COMPARISON_STRATEGY,
          useClass: DeepDiffStrategy,
        },
      ],
    })
    export class AppModule {}
    ```

Very often when developers need to know if there were any changes inside the a form in order to present a unsaved changes confirmation dialog when navigating away or in order to disable the save button when there is nothing new to save. The `FormControlChangeTrackerModule` provides two things:

- The `ChangeTrackerDirective (hgChangeTracker)` that can be set on the individual form controls in order to track if any changes are made

- And the `@hasChanges()` decorator that is applied over the `ChangeTrackerDirective` directives in order to provide you a boolean value indicating if there are any changes or not.

## Usage

### 1. New Container API (Recommended)

The new API allows you to track changes directly in your template without needing complex decorators.

**app.module.ts**

```typescript
imports: [
  // ...
  FormControlChangeTrackerModule,
];
```

**template**

```html
<form [formGroup]="form" (ngSubmit)="submit()" hgChangeTrackerContainer #tracker="hgChangeTrackerContainer">
  <div class="form-group">
    <label>First Name</label>
    <!-- Auto-captures initial value on init -->
    <input formControlName="firstName" hgChangeTracker />
  </div>

  <div class="form-group">
    <label>Last Name</label>
    <input formControlName="lastName" hgChangeTracker />
  </div>

  <!-- Check for changes anywhere in the form -->
  <button [disabled]="!tracker.hasChanges">Submit</button>

  <!-- Reset initial/default values to current values -->
  <button [disabled]="!tracker.hasChanges" (click)="tracker.resync()">Update Defaults</button>
</form>
```

### 2. Configuration Options

**Debounce Time**
Adjust the debounce time for change detection (default: 20ms).

```html
<input hgChangeTracker [debounceTime]="300" />
```

**Multi-Initial Values**
Allow multiple values to be considered "valid" (unchanged).

```html
<input hgChangeTracker [multiInitialValue]="true" [initialValue]="['A', 'B']" />
```

**Auto-Sync**
Control whether the directive automatically captures the initial value.

```html
<!-- Disable auto sync if you want full manual control -->
<input hgChangeTracker [autoInitialValueSync]="false" [initialValue]="startValue" />
```

### 3. Legacy Decorator API

The library serves backward compatibility for the `@hasChanges()` decorator usage.

```typescript
@Component({...})
export class MyComponent {
  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges: boolean;
}
```

## Features

- **Deep Comparison**: Uses deep-diff strategies to correctly track object changes.
- **Reactive**: Built on RxJS for efficient change detection.
- **Debounced**: Prevents UI thrashing on high-frequency inputs.
- **Container Support**: Easily aggregate change status for an entire form.
