import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { interval, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { ITask } from '../../models/task.model';
import { TaskActions } from '../../stores/tasks/task.actions';
import { TaskState } from '../../stores/tasks/task.state';

@Component({
  selector: 'app-answers-table',
  templateUrl: './answers-table.component.html',
  styleUrls: ['./answers-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnswersTableComponent implements OnInit, OnDestroy {

  @Select(TaskState.getTasks) tasks$!: Observable<ITask[]>;

  destroy$ = new Subject<void>();
  polling$ = interval(2500)
    .pipe(
      switchMap(() => this.store.dispatch(TaskActions.FetchAllTasks)),
      takeUntil(this.destroy$)
    );

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(TaskActions.FetchAllTasks);
    this.polling$.subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByTaskId(index: number, task: ITask): string {
    return task.taskId;
  }

}
