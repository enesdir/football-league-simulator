import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { take } from 'rxjs/internal/operators/take';
import { SimulationService } from '@/simulation/services/simulation.service';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
  ],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  simulationService = inject(SimulationService);
  router = inject(Router);

  simulationExists$ = this.simulationService.simulationState$.pipe(
    map(
      (state) =>
        state !== null &&
        state.simulatedLeagues &&
        state.simulatedLeagues.length > 0
    )
  );

  startSimulation(): void {
    this.simulationExists$.pipe(take(1)).subscribe((exists) => {
      if (exists) {
        console.log('exists');
        this.router.navigate(['/simulation/team-selection']);
      } else {
        this.router.navigate(['/simulation/team-selection']);
      }
    });
  }

  continueSimulation(): void {
    this.router.navigate(['/simulation']);
  }
}
