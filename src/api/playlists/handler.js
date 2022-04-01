class PlaylistsHandler {
  constructor(service, validator) {
    this._playlistsService = service.playlist;
    this._usersService = service.user;
    this._songsService = service.song;
    this._validatorPlaylist = validator.playlist;
    this._validatorPlaylistSong = validator.playlistSong;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongByIdHandler = this.postPlaylistSongByIdHandler.bind(this);
    this.getPlaylistSongsByIdHandler = this.getPlaylistSongsByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const idUser = await this._usersService.verifyUserExist(credentialId);
    request.payload.owner = idUser;

    this._validatorPlaylist.validatePlaylistPayload(request.payload);

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

  async postPlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    request.payload.playlistId = playlistId;
    await this._validatorPlaylistSong.validatePlaylistSongPayload(request.payload);
    await this._songsService.verifySongExist(songId);
    await this._usersService.verifyUserOwner(credentialId, playlistId);

    const playlistSong = await this._playlistsService.addPlaylistSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Playlist Song berhasil ditambahkan',
      data: {
        playlistSong,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._usersService.verifyUserOwner(credentialId, playlistId);

    const playlist = await this._playlistsService.getPlaylistById(userId, playlistId);
    const songs = await this._playlistsService.getPlaylistSongs(playlistId);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }
}

module.exports = PlaylistsHandler;
