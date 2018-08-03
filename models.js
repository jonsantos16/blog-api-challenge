const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({ content: 'string' });

const authorSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String
});

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    content: {type: String, required: true},
    created: {type: Date, required: false},
    comments: [commentSchema]
})

blogSchema.pre('find', function(next) {
    this.populate('author');
    next();
})

blogSchema.pre('findById', function(next) {
    this.populate('author');
    next();
})

blogSchema.virtual("fullName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

authorSchema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastName}`
})

authorSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.fullName,
        userName: this.userName
    }
}

blogSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        author: this.author,
        content: this.content,
        created: this.created,
    };
};

const Author = mongoose.model("Author", authorSchema);
const Blog = mongoose.model("Blogpost", blogSchema);

module.exports = { Author, Blog };
