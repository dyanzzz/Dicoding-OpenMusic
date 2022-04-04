exports.up = (pgm) => {
  // membuat album baru sebagai dummy
  pgm.sql("INSERT INTO albums(id, name, year, created_at, updated_at) VALUES ('old_album', 'old_album', 2022, '2022-04-01T16:59:56.971Z', '2022-04-01T16:59:56.971Z')");

  // mengubah nilai album_id pada songs yang album_idnya bernilai null
  pgm.sql("UPDATE songs SET album_id ='old_album' WHERE album_id is NULL");

  // memberikan constraint foreignkey pada kolom album_id dan song_id terhadap songs.id dan album.id
  pgm.addConstraint('songs', 'fk_songs.album_id_album.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.album_id_album.id pada tabel songs
  pgm.dropConstraint('songs', 'fk_songs.album_id_album.id');

  // mengubah nilai album_id old_album pada songs menjadi NULL
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_album'");

  // menghapus album baru
  pgm.sql("DELETE FROM albums WHERE id = 'old_album'");
};
