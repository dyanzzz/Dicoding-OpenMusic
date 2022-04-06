// server.js : Memuat kode untuk membuat, mengonfigurasi, dan menjalankan server HTTP menggunakan Hapi.
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');

// album
const AlbumService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const albums = require('./api/albums');
const albumEntity = require('./entity/Album');

// songs
const SongService = require('./services/postgres/SongService');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs');
const songEntity = require('./entity/Song');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');
const userEntity = require('./entity/User');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistService');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const playlistEntity = require('./entity/Playlist');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const usersService = new UsersService(playlistsService);
  const albumService = new AlbumService();
  const songService = new SongService();
  const authenticationService = new AuthenticationsService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

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
    {
      plugin: Inert,
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
        entity: {
          user: userEntity,
        },
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
        entity: {
          album: albumEntity,
          song: songEntity,
        },
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
        entity: {
          song: songEntity,
        },
        service: {
          song: songService,
        },
        validator: {
          song: SongsValidator,
        },
      },
    },
    {
      plugin: playlists,
      options: {
        entity: {
          playlist: playlistEntity,
          song: songEntity,
        },
        service: {
          playlist: playlistsService,
          user: usersService,
          song: songService,
        },
        validator: {
          playlist: PlaylistsValidator,
          playlistSong: PlaylistSongsValidator,
        },
      },
    },
    {
      plugin: collaborations,
      options: {
        service: {
          collaboration: collaborationsService,
          playlist: playlistsService,
          user: usersService,
        },
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: {
          exportService: ProducerService,
          playlist: playlistsService,
        },
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
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
