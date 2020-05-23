const express = require("express");
const app = express();
const db = require("./db");
const dbr = require("./db-r");

const s3 = require("./s3");
const { s3Url } = require("./config");

app.use(express.static("./public"));
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
//makes upload possible
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.json());

app.get("/modal/:id", (req, res) => {
    var id = req.params.id;
    db.getImageForModal(id).then(function(results) {
        db.getComments(id).then(data => {
            var jointresponse = {};
            jointresponse.image = results;
            jointresponse.comments = data;

            res.json(jointresponse);
        });
    });
});

app.get("/ingredient", (req, res) => {
    console.log("hey there");
    dbr.getIngredients().then(results => {
        console.log(results.rows);
        res.json(results.rows);
    });
});
app.get("/candy", (req, res) => {
    db.getImages().then(function(results) {
        res.json(results.rows);
    });
});
app.post("/sendcomment/:commenttext/:commentername/:id/", (req, res) => {
    var thisModal = req.params;
    db.postComment(
        thisModal.commentername,
        thisModal.commenttext,
        thisModal.id
    ).then(data => res.json(data));
});
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const body = req.body;
    const imageUrl = s3Url + req.file.filename;
    db.logImages(imageUrl, body.username, body.title, body.description).then(
        data => res.json(data)
    );
});

app.post("/loadmore/:id", (req, res) => {
    db.getNext(req.params.id).then(data => res.json(data));
});

app.post("sendprev/:id", (req, res) => {
    db.getprevim(req.params.id).then(function(results) {
        res.json(results);
    });
});

app.post("/deleteimage/:id", (req, res) => {
    db.deleteAllComments(req.params.id)
        .then(db.deleteEntry(req.params.id))
        .then(function(results) {
            res.json(results);
        })
        .catch(function(err) {
            console.log("error in get comments of comments: ", err);
        });
});
app.listen(8080, () => console.log(`808(0) listening.`));
