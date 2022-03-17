/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.renameColumn('songs', 'albumId', 'album_id');

  pgm.alterColumn('albums', 'created_at', {
    type: 'VARCHAR(30)',
    notNull: true,
  });

  pgm.alterColumn('albums', 'updated_at', {
    type: 'VARCHAR(30)',
    notNull: true,
  });
};

exports.down = (pgm) => {
  pgm.renameColumn('songs', 'albumId', 'album_id');
};
