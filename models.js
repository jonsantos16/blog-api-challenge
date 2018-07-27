const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {
        firstName: String,
        lastName: String,
    },
    content: {type: String, required: true},
    created: {type: Date, required: false}
})

blogSchema.virtual("fullName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        author: this.fullName,
        content: this.content,
        created: this.created,
    };
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = {Blog};
