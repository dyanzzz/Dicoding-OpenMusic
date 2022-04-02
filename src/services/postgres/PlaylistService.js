const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelGetAllPlaylist, mapDBToModelGetAllPlaylistActivities } = require('../../api/playlists/entityPlaylist');
const { mapDBToModelSong } = require('../../api/songs/entitySong');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationService;
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

  async addPlaylistSong(payloadData, userId) {
    const id = nanoid(16);
    const idPlaylistActivity = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, payloadData.playlistId, payloadData.songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Input Playlist Song Failed');
    }

    const queryPlaylistActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idPlaylistActivity, payloadData.playlistId, payloadData.songId, userId, 'add', time],
    };

    const resultPlaylistActivity = await this._pool.query(queryPlaylistActivity);

    if (!resultPlaylistActivity.rows.length) {
      throw new InvariantError('Input Playlist Activity Add Failed');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner=$1 OR collaborations.user_id=$1 GROUP BY playlists.id, users.id`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelGetAllPlaylist);
  }

  async getPlaylistById(userId, playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.id=$1 AND playlists.owner=$2 OR collaborations.playlist_id=$1
      GROUP BY playlists.id, users.id`,
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

  async deletePlaylistSong(playlistId, songId, userId) {
    const idPlaylistActivity = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist song gagal dihapus');
    }

    const queryPlaylistActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idPlaylistActivity, playlistId, songId, userId, 'delete', time],
    };

    const resultPlaylistActivity = await this._pool.query(queryPlaylistActivity);

    if (!resultPlaylistActivity.rows.length) {
      throw new InvariantError('Input Playlist Activity Delete Failed');
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

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username as username, songs.title as title, playlist_song_activities.action as action, playlist_song_activities.time as time
      FROM playlist_song_activities
      LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id=$1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist Activities Not Found');
    }
    return result.rows.map(mapDBToModelGetAllPlaylistActivities);
  }

  async verifyPlaylistOwner(owner, id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(userId, playlistId) {
    try {
      await this.verifyPlaylistOwner(userId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(userId, playlistId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
