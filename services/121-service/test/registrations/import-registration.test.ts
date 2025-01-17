import { HttpStatus } from '@nestjs/common';
import { registrationVisa } from '../../seed-data/mock/visa-card.data';
import { DebugScope } from '../../src/scripts/enum/debug-scope.enum';
import { SeedScript } from '../../src/scripts/seed-script.enum';
import {
  registrationScopedGoesPv,
  registrationScopedUtrechtPv,
} from '../fixtures/scoped-registrations';
import {
  importRegistrations,
  searchRegistrationByReferenceId,
} from '../helpers/registration.helper';
import {
  getAccessToken,
  getAccessTokenScoped,
  resetDB,
} from '../helpers/utility.helper';
import { programIdOCW, programIdPV } from './pagination/pagination-data';

describe('Import a registration', () => {
  let accessToken: string;

  beforeEach(async () => {
    await resetDB(SeedScript.nlrcMultiple);
  });

  it('should import registrations', async () => {
    // Arrange
    accessToken = await getAccessToken();

    // Act
    const response = await importRegistrations(
      programIdOCW,
      [registrationVisa],
      accessToken,
    );

    expect(response.statusCode).toBe(HttpStatus.CREATED);

    const result = await searchRegistrationByReferenceId(
      registrationVisa.referenceId,
      programIdOCW,
      accessToken,
    );
    const registration = result.body.data[0];
    for (const key in registrationVisa) {
      if (key === 'fspName') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(registration['financialServiceProvider']).toBe(
          registrationVisa[key],
        );
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(registration[key]).toBe(registrationVisa[key]);
      }
    }
  });

  it('should import registration scoped', async () => {
    // Arrange
    const accessToken = await getAccessTokenScoped(DebugScope.Zeeland);

    // Act
    const response = await importRegistrations(
      programIdPV,
      [registrationScopedGoesPv],
      accessToken,
    );

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CREATED);

    const result = await searchRegistrationByReferenceId(
      registrationScopedGoesPv.referenceId,
      programIdPV,
      accessToken,
    );
    const registrationResult = result.body.data[0];

    for (const key in registrationScopedGoesPv) {
      if (key === 'fspName') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(registrationResult['financialServiceProvider']).toBe(
          registrationScopedGoesPv[key],
        );
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(registrationResult[key]).toBe(registrationScopedGoesPv[key]);
      }
    }
  });

  it('should not import any registration if one of them has different scope than user', async () => {
    // Arrange
    const accessToken = await getAccessTokenScoped(DebugScope.Zeeland);

    // Act
    const response = await importRegistrations(
      programIdPV,
      [registrationScopedGoesPv, registrationScopedUtrechtPv],
      accessToken,
    );

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);

    const result = await searchRegistrationByReferenceId(
      registrationScopedGoesPv.referenceId,
      programIdPV,
      accessToken,
    );
    const registrationsResult = result.body.data;
    expect(registrationsResult).toHaveLength(0);
  });
});
