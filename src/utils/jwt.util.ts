import jwt, { SignOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'

import { env } from '@/config/env'

export interface JWTPayload {
  email: string
  sub: string
}

export class JWTUtil {
  static sign(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn as StringValue
    }

    return jwt.sign(payload, env.jwtSecret, options)
  }

  static verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as JWTPayload
    } catch {
      throw new Error('Invalid or expired token')
    }
  }
}
