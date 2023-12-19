import { HttpStatus } from '@nestjs/common';
import { DebugScope } from '../../src/scripts/enum/debug-scope.enum';
import { SeedScript } from '../../src/scripts/seed-script.enum';
import { ProgramPhase } from '../../src/shared/enum/program-phase.model';
import {
  registrationScopedGoesPv,
  registrationScopedMiddelburgPv,
} from '../fixtures/scoped-registrations';
import { changePhase } from '../helpers/program.helper';
import { importRegistrations } from '../helpers/registration.helper';
import {
  getAccessToken,
  getAccessTokenScoped,
  getServer,
  resetDB,
} from '../helpers/utility.helper';
import { programIdPV } from './pagination/pagination-data';

describe('/ Registrations - by reference-ID', () => {
  let accessToken: string;

  beforeAll(async () => {
    await resetDB(SeedScript.nlrcMultiple);
    accessToken = await getAccessToken();

    await changePhase(
      programIdPV,
      ProgramPhase.registrationValidation,
      accessToken,
    );

    await importRegistrations(
      programIdPV,
      [registrationScopedMiddelburgPv, registrationScopedGoesPv],
      accessToken,
    );
  }, 20_000);

  it('should error for non-existing registrations', async () => {
    // Arrange
    const testReferenceId = 'non-existing-reference-id';

    // Act
    const response = await getServer()
      .get(`/registrations/${testReferenceId}`)
      .set('Cookie', [accessToken])
      .send();

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.referenceId).not.toBeDefined();
  });

  it('should return the correct registration', async () => {
    // Arrange
    const testReferenceId = registrationScopedGoesPv.referenceId;

    // Act
    const response = await getServer()
      .get(`/registrations/${testReferenceId}`)
      .set('Cookie', [accessToken])
      .send();

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body.referenceId).toBe(testReferenceId);
    expect(response.body.programAnswers.length).toBe(3);
  });

  it('should return matching registration when scope matches', async () => {
    // Arrange
    const testReferenceId = registrationScopedGoesPv.referenceId;
    accessToken = await getAccessTokenScoped(DebugScope.Zeeland);

    // Act
    const response = await getServer()
      .get(`/registrations/${testReferenceId}`)
      .set('Cookie', [accessToken])
      .send();

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body.referenceId).toBe(testReferenceId);
    expect(response.body.programAnswers.length).toBe(3);
  });

  it('should not return matching registration with non-matching scope', async () => {
    // Arrange
    const testReferenceId = registrationScopedGoesPv.referenceId;
    accessToken = await getAccessTokenScoped(DebugScope.UtrechtHouten);

    // Act
    const response = await getServer()
      .get(`/registrations/${testReferenceId}`)
      .set('Cookie', [accessToken])
      .send();

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.referenceId).not.toBeDefined();
  });
});
