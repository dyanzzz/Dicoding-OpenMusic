const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum(payloadData) {
    const id = `album-${nanoid(16)}`;
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

  async getAlbums(entityAlbum) {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(entityAlbum.mapDBToModelAlbumSimple);
  }

  async getAlbumById(id, entityAlbum, entitySong) {
    const query = {
      text: 'SELECT * FROM albums WHERE id=$1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album Not Found');
    }

    const querySong = {
      text: 'SELECT * FROM songs WHERE album_id=$1',
      values: [result.rows[0].id],
    };
    const resultSong = await this._pool.query(querySong);

    const album = result.rows.map(entityAlbum.mapDBToModelAlbum)[0];
    const songs = resultSong.rows.map(entitySong.mapDBToModelSongInAlbum);
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
