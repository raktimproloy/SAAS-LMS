const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'doctorbiology',
  connectionLimit: 5
});

pool.getConnection()
  .then(conn => {
    console.log("Connected successfully");
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed: ", err);
    process.exit(1);
  });
