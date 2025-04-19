import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-simulation-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex space-y-4 flex-col justify-center items-center">
      <router-outlet />
    </div>
  `,
})
export class SimulationLayoutComponent {}
