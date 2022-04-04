const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { entity, service, validator }) => {
    const userHandler = new UsersHandler(entity, service, validator);
    server.route(routes(userHandler));
  },
};
