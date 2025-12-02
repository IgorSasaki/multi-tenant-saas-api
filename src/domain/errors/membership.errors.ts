export class MembershipNotFoundError extends Error {
  constructor(membershipId: string) {
    super(`Membership not found: ${membershipId}`)
    this.name = 'MembershipNotFoundError'
  }
}

export class MembershipAlreadyExistsError extends Error {
  constructor(userId: string, companyId: string) {
    super(`User ${userId} is already a member of company ${companyId}`)
    this.name = 'MembershipAlreadyExistsError'
  }
}

export class CannotRemoveLastOwnerError extends Error {
  constructor() {
    super('Cannot remove the last owner of the company')
    this.name = 'CannotRemoveLastOwnerError'
  }
}

export class CannotChangeOwnRoleError extends Error {
  constructor() {
    super('You cannot change your own role')
    this.name = 'CannotChangeOwnRoleError'
  }
}

export class CannotRemoveSelfError extends Error {
  constructor() {
    super('You cannot remove yourself from the company')
    this.name = 'CannotRemoveSelfError'
  }
}
