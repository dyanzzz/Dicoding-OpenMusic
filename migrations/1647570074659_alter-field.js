/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.renameColumn('songs', 'name', 'title');
};

exports.down = (pgm) => {
  pgm.renameColumn('songs', 'name', 'title');
};
