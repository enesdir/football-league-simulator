import { Component, Input } from '@angular/core';
import { Match } from '@/simulation/models/league.models';

@Component({
  selector: 'app-match-card-simple',
  standalone: true,
  template: `
    <div
      class="w-full grid grid-cols-13 justify-center items-center gap-2 md:text-xl text-sm"
    >
      <span
        class="col-span-6 text-ellipsis overflow-hidden whitespace-nowrap text-right pr-2"
      >
        {{ homeTeamName }}
      </span>
      <span
        class="flex items-center justify-center text-white bg-[#37003c] rounded-lg col-start-7 col-end-8 -m-2"
      >
        {{ match.homeGoals }} <span>-</span>{{ match.awayGoals }}
      </span>
      <span
        class="col-span-6 text-ellipsis overflow-hidden whitespace-nowrap pl-2"
      >
        {{ awayTeamName }}
      </span>
    </div>
  `,
})
export class MatchCardSimpleComponent {
  @Input() match!: Match;
  @Input() homeTeamName = '';
  @Input() awayTeamName = '';
}
