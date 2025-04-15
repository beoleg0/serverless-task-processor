export namespace TaskActions {
  export class FetchAllTasks {
    static readonly type = '[Task] Fetch All Tasks';
  }

  export class CreateTask {
    static readonly type = '[Task] Create Task';

    constructor(public answer: string) {
    }
  }

  export class SetError {
    static readonly type = '[Task] Set Error';

    constructor(public error: string) {
    }
  }

  export class ClearError {
    static readonly type = '[Task] Clear Error';
  }
}
