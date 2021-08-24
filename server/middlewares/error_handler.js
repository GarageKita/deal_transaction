class CustomError extends Error {
  constructor(name, message) {
    super()
    this.name = name
    this.message = message
  }

  static generate(err, req, res, next) {
    let status
    let { name, message } = err
    switch (name) {
      case "SequelizeValidationError":
        message = err.errors[0].message
        status = 400
        break
      case "SequelizeUniqueConstraintError":
        status = 400
        message = "One of the field already exists, please choose another value"
        break
      case "NotFound":
        status = 404
        break
      case "Unauthorized":
      case "JsonWebTokenError":
        status = 401
        break
      default:
        console.error("Uncaught Error", err)
        name = "UncaughtException"
        message = "Internal Server Error"
        status = 500
        break
    }

    return res.status(status).json({ message: 'error', response: message});
  }
}

module.exports = CustomError