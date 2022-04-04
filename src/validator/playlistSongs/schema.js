const Joi = require('joi');

const PlaylistSongPayloadSchema = Joi.object({
  playlistId: Joi.string(),
  songId: Joi.string().required(),
});

module.exports = { PlaylistSongPayloadSchema };
