import {Component, HostBinding, Input} from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-stats-screen',
  imports: [
    NgForOf
  ],
  templateUrl: './stats-screen.component.html',
  styleUrl: './stats-screen.component.css'
})
export class StatsScreenComponent {
  @Input() vesselClasses: number[] = [];
  @Input() mirrored: boolean = false;

  get allVessels(): number[] {
    return this.vesselClasses;
  }

  range(n: number): number[] {
    const array: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      array[i] = i;
    }
    return array;
  }

  @HostBinding('class.mirrored')
  get isMirrored(): boolean {
    return this.mirrored;
  }
}
