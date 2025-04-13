import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeagueSimulationComponent } from './league-simulation.component';
import { LeagueService } from '@/league/services/league.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('LeagueSimulationComponent', () => {
  let component: LeagueSimulationComponent;
  let fixture: ComponentFixture<LeagueSimulationComponent>;
  let leagueService: jasmine.SpyObj<LeagueService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const leagueServiceSpy = jasmine.createSpyObj('LeagueService', [
      'initializeLeague',
      'getTotalWeeks',
      'updateMatchResult',
      'isLeagueFinished',
      'getChampion',
      'getWeekMatches',
    ]);
    leagueServiceSpy.teams$ = of([]);
    leagueServiceSpy.currentWeek$ = of(1);

    await TestBed.configureTestingModule({
      imports: [LeagueSimulationComponent],
      providers: [
        { provide: LeagueService, useValue: leagueServiceSpy },
        {
          provide: MessageService,
          useValue: jasmine.createSpyObj('MessageService', ['add']),
        },
      ],
    }).compileComponents();

    leagueService = TestBed.inject(
      LeagueService
    ) as jasmine.SpyObj<LeagueService>;
    messageService = TestBed.inject(
      MessageService
    ) as jasmine.SpyObj<MessageService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
