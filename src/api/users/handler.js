const { mapToModelUser } = require('./entityUser');

class UsersHandler {
  constructor(service, validator) {
    this._service = service.user;
    this._validator = validator.user;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const payloadData = mapToModelUser(request.payload);

    const userId = await this._service.addUser(payloadData);

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
