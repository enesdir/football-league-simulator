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
        title: 'Welcome',
        pathMatch: 'full',
        loadComponent: () =>
          import('./landing/components/welcome/welcome.component').then(
            (m) => m.WelcomeComponent
          ),
      },
      {
        path: 'simulation',
        loadComponent: () =>
          import(
            './simulation/components/layout/simulation-layout.component'
          ).then((m) => m.SimulationLayoutComponent),
        children: [
          {
            path: '',
            title: 'Simulation',
            loadComponent: () =>
              import(
                './simulation/components/simulation-screen/simulation-screen.component'
              ).then((m) => m.SimulationScreenComponent),
          },
          {
            path: 'team-selection',
            title: 'Team Selection',
            loadComponent: () =>
              import(
                './simulation/components/selection-screen/selection-screen.component'
              ).then((m) => m.SelectionScreenComponent),
          },
          {
            path: ':leagueId/season/:seasonNumber',
            loadComponent: () =>
              import(
                './simulation/components/season-history/season-history.component'
              ).then((m) => m.SeasonHistoryComponent),
          },
        ],
      },
      {
        path: 'tutorial',
        title: 'Tutorial',
        loadComponent: () =>
          import('./landing/components/tutorial/tutorial.component').then(
            (m) => m.TutorialComponent
          ),
      },
      {
        path: 'features',
        title: 'Features',
        loadComponent: () =>
          import('./landing/components/features/features.component').then(
            (m) => m.FeaturesComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
