/**
 * Permissions in the 121-platform
 *
 * The naming convention used is similar to that of OAuth's scopes.
 * The format is:
 * `<entity>.<action>` or `<entity>:<sub-entity>.<action>`
 *
 * Where <action> is one of:
 * - create
 * - read
 * - update
 * - delete
 * - search (similar to read)
 * - export (simlar to read)
 *
 * The format used in the keys of this Enum is slightly different because of TypeScript limitations on which characters can be used.
 * The format is:
 * <Entity><ACTION> or <Entity><Sub><ACTION>
 *
 */
export enum PermissionEnum {
  // Instance(s)
  InstanceUPDATE = 'instance.update',

  // Program(s)
  ProgramCREATE = 'program.create',
  ProgramUPDATE = 'program.update',
  ProgramAllREAD = 'program:all.read',
  ProgramPhaseUPDATE = 'program:phase.update',
  ProgramQuestionUPDATE = 'program:question.update',
  ProgramMetricsREAD = 'program:metrics.read',

  // FSP(s)
  FspUPDATE = 'fsp.update',
  FspAttributeUPDATE = 'fsp:attribute.update',

  // Payment(s)
  PaymentREAD = 'payment.read',
  PaymentCREATE = 'payment.create',
  PaymentFspInstructionREAD = 'payment:fsp-instruction.read',
  PaymentTransactionREAD = 'payment:transaction.read',

  // Payment(s) - Voucher(s)
  PaymentVoucherREAD = 'payment:voucher.read',
  PaymentVoucherInstructionUPDATE = 'payment:voucher:instruction.update',

  // Registration(s)
  RegistrationREAD = 'registration.read',
  RegistrationCREATE = 'registration.create',
  RegistrationDELETE = 'registration.delete',

  RegistrationAttributeUPDATE = 'registration:attribute.update',

  RegistrationReferenceIdSEARCH = 'registration:reference-id.search',

  RegistrationFspREAD = 'registration:fsp.read',
  RegistrationFspUPDATE = 'registration:fsp.update',

  RegistrationNotificationREAD = 'registration:notification.read',
  RegistrationNotificationCREATE = 'registration:notification.create',

  // Registration(s) - Personal
  // What is 'personal'?
  RegistrationPersonalREAD = 'registration:personal.read',
  RegistrationPersonalForValidationREAD = 'registration:personal:for-valdation.read',
  RegistrationPersonalEXPORT = 'registration:personal.export',
  RegistrationPersonalSEARCH = 'registration:personal.search',
  RegistrationPersonalUPDATE = 'registration:personal.update',

  // Registration(s) - Status
  RegistrationStatusSelectedForValidationUPDATE = 'registration:status:selectedForValidation.update',
  RegistrationStatusNoLongerEligibleUPDATE = 'registration:status:noLongerEligible.update',
  RegistrationStatusIncludedUPDATE = 'registration:status:included.update',
  RegistrationStatusRejectedUPDATE = 'registration:status:rejected.update',
  RegistrationStatusInclusionEndedUPDATE = 'registration:status:inclusionEnded.update',
  RegistrationStatusInvitedUPDATE = 'registration:status:invited.update',

  // Registration(s) - Import
  RegistrationImportTemplateREAD = 'registration:import-template.read',

  // Action(s)
  ActionREAD = 'action.read',
  ActionCREATE = 'action.create',

  // User(s)
  AidWorkerCREATE = 'aid-worker.create',
  AidWorkerDELETE = 'aid-worker.delete',
  AidWorkerProgramUPDATE = 'aid-worker:program.update',

  RoleCREATE = 'role.create',

  // Used for development purposes to test endpoints only the admin can access
  Test = 'test',
}