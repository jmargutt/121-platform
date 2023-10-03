import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthService } from '../../../app/auth/auth.service';
import { provideMagicalMock } from '../../../app/mocks/helpers';
import { ProgramsServiceApiService } from '../../../app/services/programs-service-api.service';
import { ImportFspReconciliationComponent } from './import-fsp-reconciliation.component';

describe('ImportFspReconciliationComponent', () => {
  let component: ImportFspReconciliationComponent;
  let fixture: ComponentFixture<ImportFspReconciliationComponent>;

  const mockProgramId = 1;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportFspReconciliationComponent],
      imports: [
        TranslateModule.forRoot(),
        SharedModule,
        HttpClientTestingModule,
      ],
      providers: [
        provideMagicalMock(AuthService),
        provideMagicalMock(ProgramsServiceApiService),
      ],
    }).compileComponents();
  }));

  let mockProgramsApi: jasmine.SpyObj<any>;

  beforeEach(() => {
    mockProgramsApi = TestBed.inject(ProgramsServiceApiService);
    mockProgramsApi.retrieveLatestActions.and.returnValue(
      new Promise((r) => r(null)),
    );

    fixture = TestBed.createComponent(ImportFspReconciliationComponent);
    component = fixture.componentInstance;

    component.programId = mockProgramId;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
