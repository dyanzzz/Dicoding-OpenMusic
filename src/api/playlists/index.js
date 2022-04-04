const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { entity, service, validator }) => {
    const playlistHandler = new PlaylistHandler(
      entity, service, validator,
    );
    server.route(routes(playlistHandler));
  },
};
