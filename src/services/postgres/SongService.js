const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSong, mapDBToModelSongSimple } = require('../../api/songs/entitySong');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong(payloadData) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, payloadData.title, payloadData.year, payloadData.genre, payloadData.performer, payloadData.duration, payloadData.album_id, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Input Song Failed');
    }

    return result.rows[0].id;
  }

  async getSongs(payloadData) {
    const query = {
      text: "SELECT * FROM songs WHERE LOWER(title) LIKE LOWER(CONCAT('%',COALESCE($1, ''), '%')) AND LOWER(performer) LIKE LOWER(CONCAT('%',COALESCE($2, ''),'%'))",
      values: [payloadData.title, payloadData.performer],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSongSimple);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id=$1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song Not Found');
    }

    return result.rows.map(mapDBToModelSong)[0];
  }

  async editSongById(id, payloadData) {
    const updateAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id',
      values: [payloadData.title, payloadData.year, payloadData.genre, payloadData.performer, payloadData.duration, payloadData.albumId, updateAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Update Failed. Id Not Found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Delete Failed. Id Not Found');
    }
  }
}

module.exports = SongService;
