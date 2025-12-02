export class InviteNotFoundError extends Error {
  constructor(token: string) {
    super(`Invite not found: ${token}`)
    this.name = 'InviteNotFoundError'
  }
}

export class InviteExpiredError extends Error {
  constructor() {
    super('Invite has expired')
    this.name = 'InviteExpiredError'
  }
}

export class InviteAlreadyUsedError extends Error {
  constructor() {
    super('Invite has already been used')
    this.name = 'InviteAlreadyUsedError'
  }
}

export class InviteEmailMismatchError extends Error {
  constructor(expected: string, provided: string) {
    super(`Invite email mismatch. Expected: ${expected}, provided: ${provided}`)
    this.name = 'InviteEmailMismatchError'
  }
}

export class UserAlreadyMemberError extends Error {
  constructor() {
    super('User is already a member of this company')
    this.name = 'UserAlreadyMemberError'
  }
}

export class InvalidInviteTokenError extends Error {
  constructor() {
    super('Invalid invite token')
    this.name = 'InvalidInviteTokenError'
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`)
    this.name = 'InsufficientPermissionsError'
  }
}
