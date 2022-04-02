/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat album baru sebagai dummy
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_user', 'old_user', 'old_user', 'old_user')");

  // mengubah nilai album_id pada songs yang album_idnya bernilai null
  pgm.sql("UPDATE playlists SET owner='old_user' WHERE owner is NULL");

  // memberikan constraint foreignkey pada kolom album_id dan song_id terhadap songs.id dan album.id
  pgm.addConstraint('playlists', 'fk_playlists.owner_user.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.album_id_album.id pada tabel songs
  pgm.dropConstraint('playlists', 'fk_playlists.owner_user.id');

  // mengubah nilai album_id old_album pada songs menjadi NULL
  pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'old_user'");

  // menghapus album baru
  pgm.sql("DELETE FROM users WHERE id = 'old_user'");
};
