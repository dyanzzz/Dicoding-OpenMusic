// server.js : Memuat kode untuk membuat, mengonfigurasi, dan menjalankan server HTTP menggunakan Hapi.
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');

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

  await server.register({
    plugin: null,
    options: {
      service: {
        album: albumService,
        song: songService,
      },
      validator: null,
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
