const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/recipes");

exports.insertIngredient = function(ingredientname) {
    return db.query(
        "INSERT INTO ingredients (ingredientname) VALUES ($1) RETURNING *",
        [ingredientname]
    );
};

exports.getIngredients = function() {
    return db.query("SELECT * FROM ingredients");
};
exports.getUnits = function() {
    return db.query("SELECT * FROM units");
};

//  create table units(number SERIAL PRIMARY KEY, unit VARCHAR NOT NULL);
