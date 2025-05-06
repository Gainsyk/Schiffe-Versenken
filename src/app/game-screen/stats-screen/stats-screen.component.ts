import {Component, HostBinding, Input} from '@angular/core';
import {AsyncPipe, NgForOf} from '@angular/common';
import {StatsService} from '../../services/stats.service';
import {VesselPlacement} from '../../models/vessel.model';

@Component({
  selector: 'app-stats-screen',
  imports: [
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './stats-screen.component.html',
  styleUrl: './stats-screen.component.css'
})
export class StatsScreenComponent {
  constructor(public stats: StatsService) {
  }

  @Input() vesselPlacements: VesselPlacement[] = [];
  @Input() mirrored: boolean = false;
  @Input() deployedShips!: number;

  @HostBinding('class.mirrored')
  get isMirrored(): boolean {
    return this.mirrored;
  }

  get allVessels(): VesselPlacement[] {
    return this.vesselPlacements;
  }

  range(n: number): number[] {
    const array: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      array[i] = i;
    }
    return array;
  }
}
