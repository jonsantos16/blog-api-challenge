const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const app = express();
app.use(express.json());

app.get('/posts', (req, res) => {
    const filters = {};
    const queryableFields = ['title', 'author'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters.field = req.query[field]
        };
    });
    Blog
        .find(filters)
        .then(blogs => res.json(
            blogs.map(Blog => Blog.serialize())
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
})

let server;

function runServer(DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            DATABASE_URL,
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


