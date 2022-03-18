// server.js : Memuat kode untuk membuat, mengonfigurasi, dan menjalankan server HTTP menggunakan Hapi.
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const albums = require('./api/albums');
const songs = require('./api/songs');

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

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
