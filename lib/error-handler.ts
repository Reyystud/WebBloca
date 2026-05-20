import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
      { status: 400 }
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  if (error instanceof Error && (error.message === 'Unauthorized')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (error instanceof Error && error.message === 'Forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  console.error('Unhandled error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}