export class CompanyNotFoundError extends Error {
  constructor(companyId: string) {
    super(`Company not found: ${companyId}`)
    this.name = 'CompanyNotFoundError'
  }
}

export class CompanyNameRequiredError extends Error {
  constructor() {
    super('Company name is required')
    this.name = 'CompanyNameRequiredError'
  }
}

export class UserNotMemberOfCompanyError extends Error {
  constructor(userId: string, companyId: string) {
    super(`User ${userId} is not a member of company ${companyId}`)
    this.name = 'UserNotMemberOfCompanyError'
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`)
    this.name = 'InsufficientPermissionsError'
  }
}
