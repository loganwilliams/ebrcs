require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
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
    filename,
  } = request.body;

  if (+length === 0) return;

  pool.query(
    "INSERT INTO calls (talkgroup, tgtag, length, start_time, stop_time, encrypted, filename) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [talkgroup, tgtag, length, start_time, stop_time, encrypted, filename],
    (error, result) => {
      if (error) {
        throw error;
      }

      response.status(201).send(`Call added with ID: ${result.insertId}`);
    }
  );
};

const getCalls = (request, response) => {
  const t = request.query.time ? new Date(request.query.time) : Date.now();
  t = new Date(t - 1000 * 60 * 30);
  console.log(t);

  pool.query(
    "SELECT * FROM users ORDER BY start_time DESC WHERE start_time > " + t,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  addCall,
  getCalls,
};
