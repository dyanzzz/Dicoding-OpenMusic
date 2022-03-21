// server.js : Memuat kode untuk membuat, mengonfigurasi, dan menjalankan server HTTP menggunakan Hapi.
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const albums = require('./api/albums');
const songs = require('./api/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: {
          album: albumService,
        },
        validator: {
          album: AlbumsValidator,
        },
      },
    },
    {
      plugin: songs,
      options: {
        service: {
          song: songService,
        },
        validator: {
          song: SongsValidator,
        },
      },
    },
  ]);

  await server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
