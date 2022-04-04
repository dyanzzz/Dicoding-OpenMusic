const SongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, { entity, service, validator }) => {
    const songHandler = new SongHandler(entity, service, validator);
    server.route(routes(songHandler));
  },
};
