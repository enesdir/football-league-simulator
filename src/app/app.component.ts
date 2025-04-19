import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SimulationService } from './simulation/services/simulation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private simulationService: SimulationService) {}
  ngOnInit() {
    // Try to load saved simulation on app start
    this.simulationService.loadSavedSimulation();
  }
}
