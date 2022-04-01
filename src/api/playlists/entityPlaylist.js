const mapDBToModelPlaylist = ({
  id,
  name,
  owner,
}) => ({
  id,
  name,
  owner,
});

const mapDBToModelGetAllPlaylist = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBToModelPlaylist,
  mapDBToModelGetAllPlaylist,
};
