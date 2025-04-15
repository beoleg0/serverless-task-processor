import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WindowSizeTrackerService } from './window-size-tracker.service';

@Injectable({
  providedIn: 'root'
})
export class MobileMenuService implements OnDestroy {
  private readonly menuState$ = new BehaviorSubject<boolean>(false);
  private readonly dashboardState$ = new BehaviorSubject<boolean>(false);
  private windowSizeSubscription: Subscription;
  readonly isMenuOpened$ = this.menuState$.asObservable();
  readonly isDashboardOpened$ = this.dashboardState$.asObservable();

  constructor(private windowSizeTrackerService: WindowSizeTrackerService) {
    this.windowSizeSubscription = this.windowSizeTrackerService.windowSize$.subscribe((size) => {
      if (this.windowSizeTrackerService.isWidthGreaterThan(1100)) {
        this.closeMenu();
        this.closeDashboard();
      }
    });
  }

  ngOnDestroy(): void {
    this.windowSizeSubscription.unsubscribe();
  }

  openMenu(): void {
    this.menuState$.next(true);
  }

  closeMenu(): void {
    this.menuState$.next(false);
  }

  openDashboard(): void {
    this.dashboardState$.next(true);
  }

  closeDashboard(): void {
    this.dashboardState$.next(false);
  }
}
