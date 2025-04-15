import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AnswerFormComponent } from './components/answer-form/answer-form.component';
import { AnswerStatusChipComponent } from './components/answer-status-chip/answer-status-chip.component';
import { AnswersTableComponent } from './components/answers-table/answers-table.component';
import { HeaderComponent } from './components/header/header.component';
import { TaskState } from './stores/tasks/task.state';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AnswerFormComponent,
    AnswersTableComponent,
    AnswerStatusChipComponent,
    MobileMenuComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxsModule.forRoot([TaskState], {
      developmentMode: !environment.production
    }),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
