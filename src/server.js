// server.js : Memuat kode untuk membuat, mengonfigurasi, dan menjalankan server HTTP menggunakan Hapi.
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// album
const AlbumService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const albums = require('./api/albums');

// songs
const SongService = require('./services/postgres/SongService');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
  const usersService = new UsersService();
  const albumService = new AlbumService();
  const songService = new SongService();
  const authenticationService = new AuthenticationsService();

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
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: {
          user: usersService,
        },
        validator: {
          user: UsersValidator,
        },
      },
    },
    {
      plugin: authentications,
      options: {
        service: {
          authentications: authenticationService,
          user: usersService,
        },
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
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
