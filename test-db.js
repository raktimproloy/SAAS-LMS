const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'sql12.freesqldatabase.com',
  port: 3306,
  user: 'sql12834288',
  password: 'IQ7hqEekQl',
  database: 'sql12834288',
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
