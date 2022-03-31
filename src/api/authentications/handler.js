const { mapToModelUser } = require('../users/entityUser');
const { mapToModelAuthentication } = require('./entityAuthentication');

class AuthenticationsHandler {
  constructor(service, tokenManager, validator) {
    this._authenticationService = service.authenticationService;
    this._userService = service.userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const payloadData = mapToModelUser(request.payload);
    const id = await this._userService.verifyUserCredential(payloadData);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const payloadData = mapToModelAuthentication(request.payload);
    await this._authenticationService.verifyRefreshToken(payloadData);
    const { id } = this._tokenManager.verifyRefreshToken(payloadData);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbaharui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const payloadData = mapToModelAuthentication(request.payload);
    await this._authenticationService.verifyRefreshToken(payloadData);
    await this._authenticationService.deleteRefreshToken(payloadData);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
