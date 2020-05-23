const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

exports.getImages = function() {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 6`);
};

exports.logImages = function(url, username, title, description) {
    return db.query(
        "INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [url, username, title, description]
    );
};
exports.getImageForModal = function(id) {
    return db.query(`SELECT * FROM images WHERE id=$1`, [id]);
};
exports.postComment = function(commenter, message, photo_id) {
    return db.query(
        "INSERT INTO comments (commenter, message, photo_id) values ($1, $2, $3) RETURNING *",
        [commenter, message, photo_id]
    );
};

exports.getComments = function(id) {
    return db.query(
        `SELECT * FROM comments WHERE photo_id = $1 ORDER BY created_at DESC`,
        [id]
    );
};

exports.getNext = lastId =>
    db
        .query(
            `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 6`,
            [lastId]
        )
        .then(({ rows }) => rows);

exports.getprevim = function(id) {
    return db.query(
        "SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1",
        [id]
    );
};
exports.deleteAllComments = function(id) {
    return db.query("DELETE FROM comments WHERE photo_id = $1", [id]);
};
exports.deleteEntry = function(id) {
    return db.query("DELETE FROM images WHERE id = $1", [id]);
};
