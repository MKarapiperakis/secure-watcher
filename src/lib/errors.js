class RestError extends Error {
    constructor(status, message, statusDetail) {
      super(message)
      this.status = status
      this.statusDetail = statusDetail
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  class BadRequestError extends RestError {
    constructor(message, statusDetail = 'Bad Request') { super(400, message, statusDetail) }
  }
  
  class AuthError extends RestError {
    constructor(message, statusDetail = 'Unauthorized') { super(401, message, statusDetail) }
  }
  
  class ForbiddenError extends RestError {
    constructor(message, statusDetail = 'Forbidden') { super(403, message, statusDetail) }
  }
  
  class NotFoundError extends RestError {
    constructor(message, statusDetail = 'Not Found') { super(404, message, statusDetail) }
  }
  
  module.exports = {
    AuthError,
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    RestError
  }