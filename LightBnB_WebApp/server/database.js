const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  const queryStr = `
  SELECT * FROM users
  WHERE email = $1;
  `;

  return pool.query(queryStr, [email])
    .then(res => {
      return res.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });

};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {

  const queryStr = `SELECT * FROM users WHERE id=$1`;
  return pool.query(queryStr, [id])
    .then(res => {
      return res.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const values = [user.name, user.email, user.password];
  const queryStr = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;

  return pool.query(queryStr, values)
    .then(res => {
      return res.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });

};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

  const values = [guest_id, limit];
  
  const queryStr = `
  SELECT reservations.*, properties.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
  `;

  return pool.query(queryStr, values)
    .then(res => {
      return res.rows;
    })
    .catch(err => {
      console.log(err.message);
    });

};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const {
    city,
    owner_id,
    minimum_price_per_night,
    maximum_price_per_night,
    minimum_rating
  } = options;
  const queryParams = [];
  let queryStr = `
  SELECT properties.* , AVG(rating) AS average_rating
  FROM properties
  JOIN property_reviews ON properties.id=property_id
  `;

  // Add city filter if present
  if (city) {
    queryParams.push(`%${city}%`);
    queryStr += `WHERE city ILIKE $${queryParams.length}`;
  }

  // Add owner_id filter if present
  if (owner_id) {
    if (queryParams.length) {
      queryStr += ' AND ';
    } else {
      queryStr += 'WHERE ';
    }
    queryParams.push(owner_id);
    queryStr += `owner_id = $${queryParams.length}`;
  }

  // Add price per night filter if present
  if (minimum_price_per_night || maximum_price_per_night) {
    const min = minimum_price_per_night * 100 || 0;
    const max = maximum_price_per_night * 100 || 1000000000;
    if (queryParams.length) {
      queryStr += ' AND ';
    } else {
      queryStr += 'WHERE ';
    }
    queryParams.push(min, max);
    queryStr += `cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
  }

  // Add minimum rating filter if present
  if (minimum_rating) {

    queryParams.push(Number(minimum_rating), limit);
    queryStr += `
    GROUP BY properties.id
    HAVING AVG(rating) >= $${queryParams.length - 1}
    ORDER BY cost_per_night
    LIMIT $${queryParams.length}; 
    `;
  } else {
    // when no minimum rating filter is present, add end of query below
    queryParams.push(limit);
    queryStr += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  }

  console.log(queryParams, queryStr);

  return pool
    .query(queryStr, queryParams)
    .then(result => {
      return result.rows;
    })
    .catch(err => {
      console.log(err.message);
    });

};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  // get input from user
  const inputParams = Object.entries(property);

  // parameters used in query
  const queryParams = [];

  // store the nonempty column name
  let columnName = [];

  // store all the dollar sign parameters placeholder
  let paramStr = [];
  let i = 1;

  inputParams.forEach(arr => {
    if (arr[1]) {
      columnName.push(arr[0]);
      queryParams.push(arr[1]);
      paramStr.push(`$${i++}`);
    }
  });

  const queryStr = `
  INSERT INTO properties
  (${columnName.join()})
  VALUES
  (${paramStr.join()})
  RETURNING *`;

  console.log(queryStr, queryParams);
  return pool.query(queryStr, queryParams)
    .then(res => {
      return res.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
