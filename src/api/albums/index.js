const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, { entity, service, validator }) => {
    const albumHandler = new AlbumHandler(entity, service, validator);
    server.route(routes(albumHandler));
  },
};
