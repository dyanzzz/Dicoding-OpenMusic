const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbum, mapDBToModelAlbumSimple } = require('../../api/albums/entityAlbum');
const { mapDBToModelSongInAlbum } = require('../../api/songs/entitySong');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum(payloadData) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, payloadData.name, payloadData.year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Input Album Failed');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModelAlbumSimple);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT a.id, a.name, a.year, a.created_at, a.updated_at, s.id as id_song, s.title, s.year as year_song, s.genre, s.performer, s.duration, s.album_id FROM albums a, songs s where a.id=$1 and a.id=s.album_id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album Not Found');
    }

    const album = result.rows.map(mapDBToModelAlbum)[0];
    const songs = result.rows.map(mapDBToModelSongInAlbum);
    album.songs = songs;

    return album;
  }

  async editAlbumById(id, payloadData) {
    const updateAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2, updated_at=$3 WHERE id=$4 RETURNING id',
      values: [payloadData.name, payloadData.year, updateAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Update Failed. Id Not Found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Delete Failed. Id Not Found');
    }
  }
}

module.exports = AlbumService;
