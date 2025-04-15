import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ICreateTaskRequest, ITask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private apiEndpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {
  }

  getTasks(): Observable<ITask[]> {
    return this.http.get<{ tasks: ITask[] }>(`${this.apiEndpoint}/tasks`)
      .pipe(
        map(response => response.tasks),
        shareReplay()
      );
  }

  createTask(request: ICreateTaskRequest): Observable<ITask[]> {
    return this.http.post(`${this.apiEndpoint}/tasks`, request)
      .pipe(
        switchMap(response => this.getTasks()
        )
      );
  }
}
