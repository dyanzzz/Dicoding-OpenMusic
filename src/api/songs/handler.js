const ClientError = require('../../exceptions/ClientError');
const { mapModelToDBSong } = require('./entitySong');

class SongHandler {
  constructor(service, validator) {
    this._service = service.song;
    this._validator = validator.song;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const payloadData = mapModelToDBSong(request.payload);
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

  async getSongsHandler(request, h) {
    try {
      const payloadData = mapModelToDBSong(request.query);
      const songs = await this._service.getSongs(payloadData);

      return {
        status: 'success',
        data: {
          songs,
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

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      return {
        status: 'success',
        data: {
          song,
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

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const payloadData = mapModelToDBSong(request.payload);

      await this._service.editSongById(id, payloadData);

      return {
        status: 'success',
        message: 'Song updated success',
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

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Song deleted success',
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

module.exports = SongHandler;
