import { RouterModule, Routes } from '@angular/router';
import { TemplateFromComponent } from './template-from/template-from.component';
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/template-form'
  },
  {
    path: 'template-form',
    component: TemplateFromComponent
  },
  {
    path: 'reactive-form',
    component: ReactiveFormComponent
  }
];

export const AppRoutingModule = RouterModule.forRoot(routes);
