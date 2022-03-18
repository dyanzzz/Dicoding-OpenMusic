/* eslint-disable camelcase */

const mapDBToModelSong = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapModelToDBSong = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  createdAt,
  updatedAt,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id: albumId,
  created_at: createdAt,
  updated_at: updatedAt,
});

const mapDBToModelSongSimple = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = {
  mapDBToModelSong,
  mapModelToDBSong,
  mapDBToModelSongSimple,
};
