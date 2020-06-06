require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGHOST,
  password: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

const addCall = (request, response) => {
  const {
    talkgroup,
    tgtag,
    length,
    start_time,
    stop_time,
    encrypted,
  } = request.body;

  pool.query(
    "INSERT INTO calls (talkgroup, tgtag, length, start_time, stop_time, encrypted, tgtag) VALUES ($1, $2, $3, $4, $5, $6)",
    [talkgroup, tgtag, length, start_time, stop_time, encrypted],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(201).send(`Call added with ID: ${result.insertId}`);
    }
  );
};

module.exports = {
  addCall,
};
