import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ITask } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';
import { TaskActions } from './task.actions';

export interface TaskStateModel {
  tasks: { [id: string]: ITask };
  loading: boolean;
  error: string | null;
}

@State<TaskStateModel>({
  name: 'tasks',
  defaults: {
    tasks: {},
    loading: false,
    error: null
  }
})
@Injectable()
export class TaskState {
  constructor(private taskApiService: TaskApiService) {
  }

  @Selector()
  static getTasks(state: TaskStateModel): ITask[] {
    return Object.values(state.tasks);
  }

  @Selector()
  static getLoading(state: TaskStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: TaskStateModel): string | null {
    return state.error;
  }

  @Action(TaskActions.FetchAllTasks)
  fetchAllTasks(ctx: StateContext<TaskStateModel>) {
    const state = ctx.getState();
    ctx.setState({...state, loading: true, error: null});

    return this.taskApiService.getTasks().pipe(
      tap(tasks => {
        const tasksMap = tasks.reduce((acc, task) => ({
          ...acc,
          [task.taskId]: task
        }), {});

        ctx.setState({
          ...state,
          tasks: tasksMap,
          loading: false
        });
      }),
      catchError(error => {
        ctx.setState({
          ...state,
          loading: false,
          error: error.message || 'Failed to fetch tasks'
        });
        throw error;
      })
    );
  }

  @Action(TaskActions.CreateTask)
  createTask(ctx: StateContext<TaskStateModel>, action: TaskActions.CreateTask) {
    const state = ctx.getState();
    ctx.patchState({loading: true, error: null});
    const tempId = uuidv4();

    return this.taskApiService.createTask({
      taskId: tempId,
      answer: action.answer
    }).pipe(
      tap(tasks => {
        const tasksMap = tasks.reduce((acc, task) => ({
          ...acc,
          [task.taskId]: task
        }), {});

        ctx.setState({
          ...state,
          tasks: tasksMap,
          loading: false
        });
      }),
      catchError(error => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Failed to create task'
        });
        throw error;
      })
    );
  }

  @Action(TaskActions.SetError)
  setError(ctx: StateContext<TaskStateModel>, action: TaskActions.SetError) {
    ctx.patchState({error: action.error});
  }

  @Action(TaskActions.ClearError)
  clearError(ctx: StateContext<TaskStateModel>) {
    ctx.patchState({error: null});
  }
}
