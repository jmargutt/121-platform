export enum RegistrationStatusEnum {
  imported = 'imported',
  invited = 'invited',
  startedRegistration = 'startedRegistration',
  registered = 'registered',
  selectedForValidation = 'selectedForValidation',
  validated = 'validated',
  included = 'included',
  rejected = 'rejected',
  noLongerEligible = 'noLongerEligible',
  registeredWhileNoLongerEligible = 'registeredWhileNoLongerEligible',
  inclusionEnded = 'inclusionEnded',
  deleted = 'deleted',
}

export enum RegistrationStatusTimestampField {
  importedDate = 'importedDate',
  invitedDate = 'invitedDate',
  accountCreatedDate = 'accountCreatedDate',
  startedRegistrationDate = 'startedRegistrationDate',
  registeredWhileNoLongerEligibleDate = 'registeredWhileNoLongerEligibleDate',
  registeredDate = 'registeredDate',
  rejectionDate = 'rejectionDate',
  noLongerEligibleDate = 'noLongerEligibleDate',
  validationDate = 'validationDate',
  inclusionDate = 'inclusionDate',
  inclusionEndDate = 'inclusionEndDate',
  selectedForValidationDate = 'selectedForValidationDate',
  deleteDate = 'deleteDate',
}
