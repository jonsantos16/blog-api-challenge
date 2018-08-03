const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const express = require('express');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {PORT, DATABASE_URL} = require('./config');
const { Author, Blog } = require('./models');

const app = express();
app.use(express.json());


app.get('/authors', (req, res) => {
    Author.find()
        .then(authors => {
            res.json(authors.map(authors => authors.serialize()))
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Service Error'})
        })
})

app.get('/authors/:id', (req, res) => {
    Author.findById(req.params.id)
        .then(author => res.json(author.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Service Error'});
        })
})

app.post('/authors', (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName']
    for (let i=0; i< requiredFields; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message)
        }
    }
    Author 
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
        })
        .then(author => res.status(201).json(author.serialize()))
})

app.put('/authors/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = 
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message})
    }
    const toUpdate = {};
    const updateableFields = ['firstName', 'lastName', 'userName']

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field]
        };
    });

    Author
        .findByIdAndUpdate(req.params.id, { $set: toUpdate})
        .then(author => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal Server Error"}))
})

app.delete('/authors/:id', (req, res) => {
    Author
        .findByIdAndRemove(req.params.id)
        .then(author => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal Server Error"}))

})

app.get('/posts', (req, res) => {
    // const filters = {};
    // const queryableFields = ['title', 'author'];
    // queryableFields.forEach(field => {
    //     if (req.query[field]) {
    //         filters.field = req.query[field]
    //     };
    // });
    Blog.find()
        .then(blogs => {
            res.json(blogs.map(blog => blog.serialize()))
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
})

app.get('/posts/:id', (req, res) => {
    Blog
        .findById(req.params.id)
        .then(blog => res.json(blog.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        })
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'author_id', 'content'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message)
        }
    }
    Author
        .findById(req.body.author_id)
        .then(author => {
            if (author) {
                Blog
                    .create({
                        title: req.body.title,
                        author: req.body.id,
                        content: req.body.content
                    })
                    .then(blogPost => res.status(201).json({
                        id: blogPost.id,
                        author: `${author.firstName} ${author.lastName}`,
                        content: blogPost.content,
                        title: blogPost.title,
                        comments: blogPost.comments
                      }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({message: 'Internal Server Error'});
                    })
            }
        }
    );
})

app.put('/posts/:id', (req,res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = 
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message})
    }
    const toUpdate = {};
    const updateableFields = ['title', 'content']

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field]
        };
    });

    Blog
        .findByIdAndUpdate(req.params.id, { $set: toUpdate})
        .then(blog => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal Server Error"}));
})

app.delete('/posts/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id)
        .then(blog => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal Server Error"}));
})

let server;

function runServer(DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            DATABASE_URL,
            { useNewUrlParser: true },
            err => {
                if (err) {
                    return reject(err);
                }    
                server = app
                    .listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                    .on('error', err => {
                        mongoose.disconnect();
                        reject(err);
                    });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('closing server');
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  }

module.exports = {app, runServer, closeServer};


