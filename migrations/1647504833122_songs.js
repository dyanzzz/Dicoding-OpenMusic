exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      foreignKeys: true,
    },
    created_at: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    updated_at: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
