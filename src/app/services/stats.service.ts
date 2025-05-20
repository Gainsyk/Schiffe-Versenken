import {Injectable, signal, WritableSignal} from '@angular/core';
import {BehaviorSubject, interval, map, reduce, Subscription} from 'rxjs';
import {MessageKey} from '../i18n/messages';

@Injectable({providedIn: 'root'})

export class StatsService {
  private startTimeMs = 0;
  private timerSubscription?: Subscription;
  readonly elapsed$: BehaviorSubject<string> = new BehaviorSubject<string>('00:00');
  private deployedShips: WritableSignal<number> = signal(0);
  private shotsFired: WritableSignal<number> = signal(0);
  private hits: WritableSignal<number> = signal(0);
  private misses: WritableSignal<number> = signal(0);
  private sunkShips: WritableSignal<number> = signal(0);
  private intactSections: WritableSignal<number> = signal(0);
  private victories: WritableSignal<number> = signal(0);

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

  setDeployed(n: number) {
    return this.deployedShips.set(n);
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

  recordVictory() {
    this.victories.update((v) => v + 1);
  }

  getShots() {
    return this.shotsFired();
  }

  getHits() {
    return this.hits();
  }

  getRemainingShips() {
    return this.deployedShips() - this.sunkShips();
  }

  getAccuracy(): number {
    const shotsFired = this.shotsFired();
    return shotsFired ? Math.round(this.hits() / shotsFired * 100) : 0;
  }

  getVictories() {
    return this.victories();
  }

  countSections(vesselClasses: { class: MessageKey, amountSections: number }[]) {
    const total = vesselClasses
      .map(vc => vc.amountSections)
      .reduce((sum, n) => sum + n, 0);
    this.intactSections.set(total);
  }

  subtractSection() {
    this.intactSections.update(n => n - 1);
  }

  getIntactSections() {
    return this.intactSections();
  }
}
