/* eslint-disable camelcase */

const mapDBToModelAlbum = ({
  id,
  name,
  year,
  cover,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
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
