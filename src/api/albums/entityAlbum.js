/* eslint-disable camelcase */

const mapDBToModelAlbum = ({
  id,
  name,
  year,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToModelAlbumSimple = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelAlbumSimple,
};
