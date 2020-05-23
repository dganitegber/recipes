(function() {
    console.log("this works");
    Vue.component("new-recipe", {
        template: "#new-recipe",
        data: function() {
            return {
                selected: "",
                ingredients: [{}],
                newIngredient: null
            };
        },
        methods: {
            selectIngridient: function(e) {
                var vueInstance = this;

                console.log("changed ingredient");
                console.log(e.target.value);
                if (e.target.value === "new") {
                    vueInstance.newIngredient = true;
                } else {
                    vueInstance.newIngredient = null;
                }
                console.log("this.new", this.newIngredient);
            }
        },
        mounted: function() {
            var vueInstance = this;
            axios.get("/ingredient").then(function(res) {
                vueInstance.ingredients = res.data;
                console.log("ingredientValue", res.data);
            });
        }
    }),
        Vue.component("first-component", {
            //child
            template: "#template",
            props: ["postTitle", "id"],
            data: function() {
                return {
                    clickedImage: {},
                    comment: "",
                    commentername: "",
                    commentsforimage: [],
                    comments: []
                };
            },
            mounted: function() {
                var vueInstance = this;
                if (isNaN(this.id)) {
                    this.close();
                }

                axios
                    .get("/modal/" + this.id)
                    .then(function(res) {
                        vueInstance.clickedImage = res.data.image.rows[0];
                        vueInstance.commentsforimage = res.data.comments.rows;
                        if (res.data.image.rows.length === 0) {
                            vueInstance.close();
                        }
                    })
                    .catch(function(err) {
                        console.log("error in axios get modal: ", err);
                    });
            },
            watch: {
                id: function() {
                    if (isNaN(this.id)) {
                        this.close();
                    }
                    var vueInstance = this;
                    console.log("component mounted: ");
                    console.log("my postTitle: ", this.postTitle);
                    console.log("id: ", this.id);
                    axios
                        .get("/modal/" + this.id)
                        .then(function(res) {
                            console.log(res.data);
                            vueInstance.clickedImage = res.data.image.rows[0];
                            vueInstance.commentsforimage =
                                res.data.comments.rows;
                            console.log(res.data.comments.rows);
                        })
                        .catch(function(err) {
                            console.log("error in axios get modal: ", err);
                        });
                }
            },
            methods: {
                close: function() {
                    console.log("im close");
                    this.$emit("close", this.count);
                },
                sendComment: function() {
                    console.log("i clicked the button in modal", "35");
                    var self = this;
                    axios
                        .post(
                            "sendcomment/" +
                                this.comment +
                                "/" +
                                this.commentername +
                                "/" +
                                this.id
                        )
                        .then(function(resp) {
                            // resp.data.rows[0] image object. we want to unshift this into the vueInstance array. remember "this" will be lost. look in get how that was solved.
                            console.log("resp form POST /sendcomment: ", resp);
                            self.comment = "";
                            self.commentername = "";
                            console.log(self.commentsforimage[0]);
                            self.commentsforimage.unshift(resp.data.rows[0]);
                        })
                        .catch(function(err) {
                            console.log("err in POST /sendcomment: ", err);
                        });
                },

                deleteimage: function() {
                    console.log("im in delete");
                    var vueInstance = this;
                    axios.post("/deleteimage/" + this.id).then(function(data) {
                        console.log(data);
                        vueInstance.$emit("renderagain", vueInstance.id);
                        console.log("im after the emit");
                        vueInstance.close();
                        console.log("i'm after the close");
                    });
                }
            }
        });

    new Vue({
        el: "#main",
        data: {
            selectedImage: location.hash.slice(1),
            heading: "Welcome to my image board!",
            latest: "Latest images",
            images: [],
            title: "",
            description: "",
            username: "",
            comments: [],
            commentsforimage: [],
            lastId: null,
            files: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this;
            addEventListener("hashchange", function() {
                vueInstance.selectedImage = location.hash.slice(1);
            });
            axios
                .get("/candy")
                .then(function(res) {
                    vueInstance.images = res.data;
                })
                .catch(function(err) {
                    console.log("error in axios get candy: ", err);
                });
        },

        methods: {
            closeMe: function() {
                console.log("i need to close the modal!!!");
                console.log(this.selectedImage);
                location.hash = "";
                this.selectedImage = null;
            },
            handleClick: function(e) {
                e.preventDefault();
                //we use FormData to send a file to the server
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var vueInstance = this;
                axios
                    .post("upload", formData)
                    .then(function(resp) {
                        console.log("resp form POST /upload: ", resp);
                        console.log("resp.data.rows[0]", resp.data.rows[0]);
                        console.log(vueInstance);
                        vueInstance.images.unshift(resp.data.rows[0]);
                        vueInstance.title = "";
                        vueInstance.description = "";
                        vueInstance.username = "";
                    })
                    .catch(function(err) {
                        console.log("err in POST /upload: ", err);
                    });
            },

            sendComment: function() {
                console.log("send comment");

                // e.preventDefault();
                console.log(this, "this");
                axios
                    .post("sendcomment/" + this.comment)
                    .then(function(resp) {
                        // resp.data.rows[0] image object. we want to unshift this into the vueInstance array. remember "this" will be lost. look in get how that was solved.
                        console.log("resp form POST /sendcomment: ", resp);
                    })
                    .catch(function(err) {
                        console.log("err in POST /sendcomment: ", err);
                    });
            },

            loadMore: function(e) {
                e.preventDefault();

                let vueInstance = this;
                console.log(this.images.length - 1);
                console.log(
                    "gives the location of the last object in the array ie the image with the highest index",
                    this.images[this.images.length - 1]
                );

                this.lastId = this.images[this.images.length - 1].id;
                axios
                    .post("loadmore/" + this.lastId)
                    .then(function(data) {
                        for (var i = 0; i < data.data.length; i++) {
                            vueInstance.images.push(data.data[i]);
                        }
                    })
                    .catch(function(err) {
                        console.log("err in POST /loadmore: ", err);
                    });
                this.lastId = null;
            },

            handleChange: function(e) {
                this.files = e.target.files;
                console.log(this.files.length);
            },

            refresh: function(id) {
                for (var i in this.images) {
                    if (this.images[i].id == id) {
                        this.images.splice(i, 1);
                    }
                }
            }
        }
    });
})();
