import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RouterModule, CardModule, ButtonModule, DividerModule, TableModule],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {}
