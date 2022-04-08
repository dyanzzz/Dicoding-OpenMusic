class AlbumHandler {
  constructor(entity, service, validator) {
    this._albumEntity = entity.album;
    this._songEntity = entity.song;
    this._albumsService = service.album;
    this._likesService = service.like;
    this._usersService = service.user;
    this._albumValidator = validator.album;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getCountAlbumLikesHandler = this.getCountAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const payloadData = this._albumEntity.mapDBToModelAlbum(request.payload);

    const albumId = await this._albumsService.addAlbum(payloadData);

    const response = h.response({
      status: 'success',
      message: 'Added Album Success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const album = await this._albumsService.getAlbums(this._albumEntity);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    console.log(`${new Date()} - ${request.raw.req.url}`);
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id, this._albumEntity, this._songEntity);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const payloadData = this._albumEntity.mapDBToModelAlbum(request.payload);

    await this._albumsService.editAlbumById(id, payloadData);

    return {
      status: 'success',
      message: 'Album updated success',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted success',
    };
  }

  async postLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.getAlbumById(albumId, this._albumEntity, this._songEntity);
    await this._usersService.verifyUserExist(credentialId);
    const likeStatus = await this._likesService.verifyLike(credentialId, albumId);

    let likeId = '';
    let message = '';
    if (!likeStatus) {
      likeId = await this._likesService.addLike(credentialId, albumId);
      message = 'Likes berhasil ditambahkan';
    } else {
      likeId = await this._likesService.deleteLike(credentialId, albumId);
      message = 'Likes berhasil dihapus';
    }

    const response = h.response({
      status: 'success',
      message,
      data: {
        likeId,
      },
    });
    response.code(201);
    return response;
  }

  async getCountAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const result = await this._likesService.getCountLikesAlbumById(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: result.likes,
      },
    });

    if (result.source === 'cache') {
      response.header('X-Data-Source', result.source);
    } else {
      response.header('X-Data-Source', '');
    }

    return response;
  }
}

module.exports = AlbumHandler;
