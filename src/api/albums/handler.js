const ClientError = require('../../exceptions/ClientError');
const { mapDBToModelAlbum } = require('./entityAlbum');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service.album;
    this._validator = validator.album;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const payloadData = mapDBToModelAlbum(request.payload);

      const albumId = await this._service.addAlbum(payloadData);

      const response = h.response({
        status: 'success',
        message: 'Added Album Success',
        data: {
          albumId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Sorry, Server Error',
      });

      response.code(500);
      console.log(error);
      return response;
    }
  }

  async getAlbumsHandler() {
    const album = await this._service.getAlbums();

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Sorry, Server error',
      });

      response.code(500);
      console.log(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const payloadData = mapDBToModelAlbum(request.payload);

      await this._service.editAlbumById(id, payloadData);

      return {
        status: 'success',
        message: 'Album updated success',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Sorry, Server error',
      });

      response.code(500);
      console.log(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album deleted success',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Sorry, Server error',
      });

      response.code(500);
      console.log(error);
      return response;
    }
  }
}

module.exports = AlbumHandler;
