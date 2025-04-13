import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/simple-layout/simple-layout.component').then(
        (m) => m.SimpleLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./landing/components/welcome/welcome.component').then(
            (m) => m.WelcomeComponent
          ),
      },
      {
        path: 'simulation',
        loadChildren: () =>
          import('./league/league.module').then((m) => m.LeagueModule),
      },
      {
        path: 'tutorial',
        loadComponent: () =>
          import('./landing/components/tutorial/tutorial.component').then(
            (m) => m.TutorialComponent
          ),
      },
      {
        path: 'features',
        loadComponent: () =>
          import('./landing/components/features/features.component').then(
            (m) => m.FeaturesComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
