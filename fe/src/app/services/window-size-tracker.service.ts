import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, share } from 'rxjs/operators';

export interface WindowSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowSizeTrackerService {
  private windowSizeSubject = new BehaviorSubject<WindowSize>(this.getCurrentWindowSize());
  public windowSize$: Observable<WindowSize> = this.windowSizeSubject.asObservable();

  constructor() {
    this.initWindowResizeListener();
  }

  private initWindowResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        map(() => this.getCurrentWindowSize()),
        distinctUntilChanged((prev, curr) =>
          prev.width === curr.width && prev.height === curr.height
        ),
        share()
      )
      .subscribe(size => this.windowSizeSubject.next(size));
  }

  private getCurrentWindowSize(): WindowSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  public get currentWindowSize(): WindowSize {
    return this.windowSizeSubject.value;
  }

  public isWidthLessThan(width: number): boolean {
    return this.currentWindowSize.width < width;
  }

  public isWidthGreaterThan(width: number): boolean {
    return this.currentWindowSize.width > width;
  }
}
