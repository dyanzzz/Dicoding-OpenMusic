exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id dan song_id
  // Guna menghindari nilai duplikasi dara antara keduanya
  pgm.addConstraint('playlistsongs', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)');

  // memberikan constraint foreignkey pada kolom playlist_id dan song_id terhadap notes.id dan users.id
  pgm.addConstraint('playlistsongs', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlistsongs', 'fk_collaborations.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsongs');
};
