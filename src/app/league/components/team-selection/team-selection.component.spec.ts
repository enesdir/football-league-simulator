import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamSelectionComponent } from './team-selection.component';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('TeamSelectionComponent', () => {
  let component: TeamSelectionComponent;
  let fixture: ComponentFixture<TeamSelectionComponent>;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSelectionComponent],
      providers: [ConfirmationService, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamSelectionComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default teams', () => {
    expect(component.teams.length).toBe(4);
    expect(component.teams[0].name).toBe('Arsenal');
    expect(component.teams[1].name).toBe('Chelsea');
  });

  it('should reset to default teams', () => {
    spyOn(messageService, 'add');
    component.resetToDefaultTeams();
    expect(component.teams.length).toBe(2);
    expect(component.teams[0].name).toBe('Arsenal');
    expect(component.teams[1].name).toBe('Chelsea');
  });

  it('should emit teams on startLeague if valid', () => {
    spyOn(component.startLeague, 'emit');
    component.onStartLeague();
    expect(component.startLeague.emit).toHaveBeenCalledWith(
      jasmine.arrayContaining([
        jasmine.objectContaining({ name: 'Arsenal' }),
        jasmine.objectContaining({ name: 'Chelsea' }),
      ])
    );
  });

  it('should validate teams correctly', () => {
    expect(component.isValid()).toBeTrue();
    component.teams = [];
    expect(component.isValid()).toBeFalse();
    component.teams = [
      {
        id: 1,
        name: '',
        strength: 80,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        hasChance: true,
      },
    ];
    expect(component.isValid()).toBeFalse();
  });
});
