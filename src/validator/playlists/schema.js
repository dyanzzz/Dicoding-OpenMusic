const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string(),
});

module.exports = { PlaylistPayloadSchema };
