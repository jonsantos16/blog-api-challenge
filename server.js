const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const express = require('express');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {PORT, DATABASE_URL} = require('./config');
const { Blog } = require('./models');

const app = express();
app.use(express.json());

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
    const requiredFields = ['title', 'author', 'content'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message)
        }
    }
    Blog
        .create({
            title: req.body.title,
            author: {
                firstName: req.body.author.firstName,
                lastName: req.body.author.lastName
            },
            content: req.body.content
        })
        .then(blog => res.status(201).json(blog.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

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


