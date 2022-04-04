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

const mapDBToModelGetAllPlaylistActivities = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapDBToModelPlaylist,
  mapDBToModelGetAllPlaylist,
  mapDBToModelGetAllPlaylistActivities,
};
