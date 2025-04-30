import {Injectable} from '@angular/core';
import {BehaviorSubject, interval, map, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class StatsService {
  private startTimeMs = 0;
  private timerSubscription?: Subscription;
  readonly elapsed$ = new BehaviorSubject<string>('00:00');

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
}
