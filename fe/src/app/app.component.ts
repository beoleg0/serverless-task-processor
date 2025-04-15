import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { combineLatest, map } from 'rxjs';
import { MobileMenuService } from './services/mobile-menu.service';
import { WindowSizeTrackerService } from './services/window-size-tracker.service';
import { TaskActions } from './stores/tasks/task.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fe';

  showTask$ = combineLatest([
    this.mobileMenuService.isDashboardOpened$,
    this.windowSizeTrackerService.windowSize$
  ])
    .pipe(
      map(([isDashboardOpened, windowSize]) => {
        return windowSize.width > 1100 || !isDashboardOpened;
      })
    );

  showDashboard$ = combineLatest([
    this.mobileMenuService.isDashboardOpened$,
    this.windowSizeTrackerService.windowSize$
  ])
    .pipe(
      map(([isDashboardOpened, windowSize]) => {
        return windowSize.width > 1100 || isDashboardOpened;
      })
    );

  constructor(
    private store: Store,
    protected mobileMenuService: MobileMenuService,
    private windowSizeTrackerService: WindowSizeTrackerService
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(new TaskActions.FetchAllTasks);
  }
}
