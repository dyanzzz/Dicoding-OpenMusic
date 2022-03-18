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

const mapDBToModelSongInAlbum = ({
  id_song,
  title,
  year_song,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  idSong: id_song,
  title,
  yearSong: year_song,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = {
  mapDBToModelSong,
  mapModelToDBSong,
  mapDBToModelSongSimple,
  mapDBToModelSongInAlbum,
};
