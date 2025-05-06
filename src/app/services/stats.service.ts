import {Injectable, Input, signal, WritableSignal} from '@angular/core';
import {BehaviorSubject, interval, map, Subscription} from 'rxjs';
import {SIGNAL} from '@angular/core/primitives/signals';

@Injectable({
  providedIn: 'root'
})

export class StatsService {
  private startTimeMs = 0;
  private timerSubscription?: Subscription;
  readonly elapsed$: BehaviorSubject<string> = new BehaviorSubject<string>('00:00');
  private shotsFired: WritableSignal<number> = signal(0);
  private hits: WritableSignal<number> = signal(0);
  private misses: WritableSignal<number> = signal(0);
  private sunkShips: WritableSignal<number> = signal(0);
  private remainingShips: WritableSignal<number> = signal(0);
  @Input() deployedShips: number;

  startTimer() {
    this.startTimeMs = Date.now();
    this.stopSubscription();
    this.timerSubscription = interval(1000).pipe(
      map(() => {
          const diff = Date.now() - this.startTimeMs;
          const mm = Math.floor(diff / 60_000).toString().padStart(2, '0');
          const ss = Math.floor((diff % 60_000) / 1000).toString().padStart(2, '0');
          return `${mm}:${ss}`;
        }
      )
    )
      .subscribe(this.elapsed$);
  }

  stopSubscription() {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
  }

  getDeployed() {
    return this.deployedShips();
  }

  recordShot() {
    this.shotsFired.update(n => n + 1);
  }

  recordHit() {
    this.hits.update(n => n + 1);
  }

  recordMiss() {
    this.misses.update(n => n + 1);
  }

  recordSunk() {
    this.sunkShips.update(n => n + 1);
  }

  getShots() {
    return this.shotsFired();
  }

  getHits() {
    return this.hits();
  }

  getMisses() {
    return this.misses();
  }

  getSunk() {
    return this.sunkShips();
  }

  getRemainingShips() {
    return this.deployedShips - this.sunkShips();
  }

  getAccuracy(): number {
    const shotsFired = this.shotsFired();
    return shotsFired ? Math.round(this.hits() / shotsFired * 100) : 0;
  }
}
