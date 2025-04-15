import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BehaviorSubject, map, startWith } from 'rxjs';
import { TaskActions } from '../../stores/tasks/task.actions';

@Component({
  selector: 'app-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnswerFormComponent {
  MAX_ANSWER_LENGTH = 200;
  form = new FormGroup({
    answer: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_ANSWER_LENGTH)])
  });
  answerLength$ = this.form.controls.answer.valueChanges
    .pipe(
      startWith(this.form.controls.answer.value || ''),
      map((value: string | null) => (value || '').length)
    );
  isSubmissionInProgress$$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store) {
  }


  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmissionInProgress$$.next(true);
    const answer = this.form.get('answer')?.value || '';
    this.store.dispatch(new TaskActions.CreateTask(answer)).subscribe({
      next: () => {
        console.log('Task created successfully');
        this.form.reset();
      },
      error: (error) => {
        console.error('Error creating task:', error);
      },
      complete: () => {
        this.isSubmissionInProgress$$.next(false);
      }
    });
  }
}
