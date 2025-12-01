export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
    this.name = 'UserAlreadyExistsError'
  }
}

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`)
    this.name = 'UserNotFoundError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class WeakPasswordError extends Error {
  constructor() {
    super('Password must be at least 8 characters long')
    this.name = 'WeakPasswordError'
  }
}
