import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-answer-status-chip',
  templateUrl: './answer-status-chip.component.html',
  styleUrls: ['./answer-status-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnswerStatusChipComponent {

  @Input() status!: TaskStatus;

  get statusClass(): Record<string, boolean> {
    return {
      'chip': true,
      'pending': this.status === TaskStatus.PENDING,
      'processing': this.status === TaskStatus.PROCESSING,
      'processed': this.status === TaskStatus.PROCESSED,
      'failed': this.status === TaskStatus.FAILED
    };
  }

  get statusText(): string {
    const statusText = {
      [TaskStatus.PENDING]: 'Pending',
      [TaskStatus.PROCESSING]: 'Processing',
      [TaskStatus.PROCESSED]: 'Processed',
      [TaskStatus.FAILED]: 'Failed'
    };
    return statusText[this.status] || '';
  }

  get statusIconPath(): string {
    const statusIconPath = {
      [TaskStatus.PENDING]: 'assets/images/clock.png',
      [TaskStatus.PROCESSING]: 'assets/images/clock.png',
      [TaskStatus.PROCESSED]: 'assets/images/check-circle.png',
      [TaskStatus.FAILED]: 'assets/images/close-circle.png'
    };
    return statusIconPath[this.status] || '';
  }
}
