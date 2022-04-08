const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class LikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Favorit gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id=$1 AND album_id=$2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`likes:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Favorit gagal dihapus');
    }
  }

  async verifyLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id=$1 AND album_id=$2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async getCountLikesAlbumById(albumId) {
    try {
      const resultQuery = await this._cacheService.get(`likes:${albumId}`);
      const getLikes = JSON.parse(resultQuery).likes;
      const result = {
        likes: getLikes,
        source: 'cache',
      };
      return result;
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id=$1',
        values: [albumId],
      };

      const resultQuery = await this._pool.query(query);
      const likes = resultQuery.rows.length;
      const result = {
        likes,
        source: 'db',
      };

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result));

      return result;
    }
  }
}

module.exports = LikeService;
