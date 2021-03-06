const mysql = require('mysql');

const connectionOptions = {
  host     : process.env.RDS_HOSTNAME || process.env.DATABASE_HOSTNAME,
  user     : process.env.RDS_USERNAME || process.env.DATABASE_USERNAME,
  password : process.env.RDS_PASSWORD || process.env.DATABASE_PASSWORD,
  database : process.env.RDS_DB_NAME  || process.env.DATABASE_DB_NAME,
  port     : process.env.RDS_PORT     || process.env.DATABASE_PORT
};
const connection = mysql.createConnection(connectionOptions);
let mariadbInterface = {};

// Create
mariadbInterface.postTimeSlot = (restaurant_id, date, time, party_size, party_size_max, cb) => {
  const q = 'INSERT INTO reservations SET ?';
  const reservation = {
    restaurant_id,
    date,
    time,
    party_size,
    party_size_max
  };
  connection.query(q, reservation, (error, results, fields) => cb(error, results));
};

// Bulk Create
mariadbInterface.bulkInsertIndividualReservationsArrayLines = (insertionQueryString, arrayLines, cb) => {
  // Note: We're building a array wherein each element is an array of values matching the columns
  let batch = [];
  for(var i = 0; i < arrayLines.length; i++) {
    batch.push(arrayLines[i]);
  }
  // Example insertionQueryString:
  //   - 'INSERT INTO reservations (restaurant_id, date, time, party_size, party_size_max) VALUES ?'
  connection.query(insertionQueryString, [batch], (error, results, fields) => cb(error, results));
};

mariadbInterface.bulkInsertUsersArrayBatch = (batchArray) => {
  let q = 'INSERT INTO users (username, email) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

mariadbInterface.bulkInsertRestaurantArrayBatch = (batchArray) => {
  let q = 'INSERT INTO restaurants (restaurant_name, cuisine, phone_number, address, website, dining_style) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

mariadbInterface.bulkInsertReservationsArrayBatch = (batchArray) => {
  let q = 'INSERT INTO reservations (user_id, restaurant_id, party_size, party_size_max, date, time) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

// Retrieval
mariadbInterface.grabReservation = (reservation_id, cb) => {
  const q = 'SELECT * FROM reservations WHERE id = ?';
  connection.query(q, [reservation_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabReservations = (restaurant_id, date, time, cb) => {
  const q = `SELECT * FROM reservations WHERE (restaurant_id = ? ${ date ? '&& date = ?' : '' } ${ time ? '&& time = ?' : '' })`;
  connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabTimeSlots = (restaurant_id, date, cb) => {
  const q = 'SELECT * FROM reservations WHERE (restaurant_id = ? && date = ?);';
  connection.query(q, [restaurant_id, date], (error, results, fields) => cb(error, results));
};

// Update
mariadbInterface.updateReservation = (reservation_id, new_date, new_time, cb) => {
  const q = 'UPDATE reservations SET date = ?, time = ? WHERE id = ?;';
  connection.query(q, [new_date, new_time, reservation_id], (error, results, fields) => cb(error, results));
};

// Destroy
mariadbInterface.deleteReservation = (restaurant_id, reservation_id, cb) => {
  const q = 'DELETE FROM reservations WHERE id = ?;';
  connection.query(q, [reservation_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.deleteReservationsAtTimeSlot = (restaurant_id, date, time, cb) => {
  const q = 'DELETE FROM reservations WHERE (restaurant_id = ? && date = ? && time = ?);';
  connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
};

module.exports = mariadbInterface;
