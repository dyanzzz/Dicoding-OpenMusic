class SongHandler {
  constructor(entity, service, validator) {
    this._songEntity = entity.song;
    this._service = service.song;
    this._validator = validator.song;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const payloadData = this._songEntity.mapModelToDBSong(request.payload);
    const songId = await this._service.addSong(payloadData);

    const response = h.response({
      status: 'success',
      message: 'Added Song Success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const payloadData = this._songEntity.mapModelToDBSong(request.query);
    const songs = await this._service.getSongs(payloadData, this._songEntity);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id, this._songEntity);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const payloadData = this._songEntity.mapModelToDBSong(request.payload);

    await this._service.editSongById(id, payloadData);

    return {
      status: 'success',
      message: 'Song updated success',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song deleted success',
    };
  }
}

module.exports = SongHandler;
