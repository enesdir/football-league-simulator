import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChampionshipProbabilityComponent } from './championship-probability.component';

describe('ChampionshipProbabilityComponent', () => {
  let component: ChampionshipProbabilityComponent;
  let fixture: ComponentFixture<ChampionshipProbabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChampionshipProbabilityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChampionshipProbabilityComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
