import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeagueControlsComponent } from './league-controls.component';
import { LeagueService } from '@/league/services/league.service';
import { of } from 'rxjs';

describe('LeagueControlsComponent', () => {
  let component: LeagueControlsComponent;
  let fixture: ComponentFixture<LeagueControlsComponent>;
  let mockLeagueService: jasmine.SpyObj<LeagueService>;

  beforeEach(async () => {
    mockLeagueService = jasmine.createSpyObj(
      'LeagueService',
      ['playNextWeek', 'playEntireLeague'],
      {
        isLeagueComplete$: of(false),
      }
    );

    await TestBed.configureTestingModule({
      imports: [LeagueControlsComponent],
      providers: [{ provide: LeagueService, useValue: mockLeagueService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLeagueFinished to false initially', () => {
    expect(component.isLeagueFinished).toBeFalse();
  });

  it('should call playNextWeek on the leagueService when playNextWeek is invoked', () => {
    component.playNextWeek();
    expect(mockLeagueService.playNextWeek).toHaveBeenCalled();
  });

  it('should call playEntireLeague on the leagueService when playEntireLeague is invoked', () => {
    component.playEntireLeague();
    expect(mockLeagueService.playEntireLeague).toHaveBeenCalled();
  });

  it('should emit resetLeague event when onResetLeague is called', () => {
    spyOn(component.resetLeague, 'emit');
    component.onResetLeague();
    expect(component.resetLeague.emit).toHaveBeenCalled();
  });
});
