class ExportsHandler {
  constructor(service, validator) {
    this._exportService = service.exportService;
    this._playlistsService = service.playlist;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId: id } = request.params;

    this._validator.validateExportPlaylistPayload(request.payload);

    const message = {
      userId: credentialId,
      playlistId: id,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistAccess(credentialId, id);
    await this._exportService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
