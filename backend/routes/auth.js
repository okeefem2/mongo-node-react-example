const Router = require('express').Router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../db");

const router = Router();

const createToken = () => {
  return jwt.sign({}, 'secret', { expiresIn: '1h' });
};

router.post('/login', (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Check if user login is valid
  // If yes, create token and return it to client
  db.getDb()
        .collection("users")
        .findOne({email: email})
        .then(async (result) => {
          if (!result) {
            throw Error();
          }
          const passwordValid = await bcrypt.compare(pw, result.password);
          console.log(passwordValid);
          if (passwordValid) {
            console.log(result);
            const token = createToken();
            res.status(200).json({ token: token, user: { email: email } });
          } else {
            throw Error();
          }
        })
        .catch(err => {
          console.log(err);
          res
          .status(401)
          .json({ message: 'Authentication failed, invalid username or password.' });
        });
});

router.post('/signup', (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Hash password before storing it in database => Encryption at Rest
  bcrypt
    .hash(pw, 12)
    .then(hashedPW => {
      // Store hashedPW in database
      console.log(hashedPW);
      db.getDb()
        .collection("users")
        .insertOne({email: email, password: hashedPW})
        .then(result => {
          console.log(result);
          const token = createToken();
          res
            .status(201)
            .json({ token: token, user: { email: 'dummy@dummy.com' } });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: 'Creating the user failed.' });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Creating the user failed.' });
    });
  // Add user to database
});

module.exports = router;
