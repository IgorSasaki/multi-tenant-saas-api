import { UserResponseDTO } from '@/domain/entities/user.entity'

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDTO
    }
  }
}
