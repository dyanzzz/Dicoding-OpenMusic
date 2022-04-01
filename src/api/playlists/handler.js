class PlaylistsHandler {
  constructor(playlistsService, usersService, validator) {
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const idUser = await this._usersService.verifyUserExist(credentialId);
    request.payload.owner = idUser;

    this._validator.validatePlaylistPayload(request.payload);

    const playlistId = await this._playlistsService.addPlaylist(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._usersService.verifyUserOwner(credentialId, playlistId);

    await this._playlistsService.deletePlaylist(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });

    return response;
  }

/*   async postPlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { song } = request.payload;

    await this._usersService.verifyUserOwner(credentialId, playlistId);
    const idUser = await this._usersService.verifyUserExist(credentialId);
    request.payload.owner = idUser;

    this._validator.validatePlaylistPayload(request.payload);

    const playlistId = await this._playlistsService.addPlaylist(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  } */
}

module.exports = PlaylistsHandler;
