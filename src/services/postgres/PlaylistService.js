const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelGetAllPlaylist } = require('../../api/playlists/entityPlaylist');
const { mapDBToModelSong } = require('../../api/songs/entitySong');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(payloadData) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, payloadData.name, payloadData.owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Input Playlist Failed');
    }

    return result.rows[0].id;
  }

  async addPlaylistSong(payloadData) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, payloadData.playlistId, payloadData.songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Input Playlist Song Failed');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner=$1 GROUP BY playlists.id, users.id`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelGetAllPlaylist);
  }

  async getPlaylistById(userId, playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id=$1 AND playlists.owner=$2 GROUP BY playlists.id, users.id`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist By Id Not Found');
    }
    return result.rows.map(mapDBToModelGetAllPlaylist)[0];
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
      LEFT JOIN songs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id=$1 GROUP BY playlistsongs.id, songs.id`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist Songs Not Found');
    }
    return result.rows.map(mapDBToModelSong);
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async verifyPlaylist(name, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE name = $1 AND owner = $2',
      values: [name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal diverifikasi');
    }
  }
}

module.exports = PlaylistService;
