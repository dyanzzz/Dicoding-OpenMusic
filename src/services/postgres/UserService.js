const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor(playlistService) {
    this._playlistsService = playlistService;
    this._pool = new Pool();
  }

  async addUser(payloadData) {
    await this.verifyNewUsername(payloadData.username);

    const id = `user-${nanoid(16)}`;
    const hashPassword = await bcrypt.hash(payloadData.password, 10);

    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, payloadData.username, hashPassword, payloadData.fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username=$1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }
  }

  async verifyUserCredential(payloadData) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username=$1',
      values: [payloadData.username],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(payloadData.password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }

    return id;
  }

  async verifyUserExist(owner) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0].id;
  }
}

module.exports = UsersService;
