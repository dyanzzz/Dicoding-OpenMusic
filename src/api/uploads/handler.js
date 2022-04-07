class UploadsHandler {
  constructor(service, validator) {
    this._storagesService = service.storage;
    this._albumsService = service.album;
    this._validator = validator;

    this.postUploadImageAlbumHandler = this.postUploadImageAlbumHandler.bind(this);
  }

  async postUploadImageAlbumHandler(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    this._validator.validateImageAlbumHeaders(cover.hapi.headers);

    const filename = await this._storagesService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.editCoverAlbumById(albumId, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        fileLocation: coverUrl,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
