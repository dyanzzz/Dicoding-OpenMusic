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

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const payloadData = mapDBToModelAlbum(request.payload);

    await this._service.editAlbumById(id, payloadData);

    return {
      status: 'success',
      message: 'Album updated success',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted success',
    };
  }
}

module.exports = AlbumHandler;
