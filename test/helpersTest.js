const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user === 'userRandomID')
  });

  it('should return null if the user doesn\'t exist', function() {
    const user = getUserByEmail("turtle@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user === null);
  });
});

// console.log(getUserByEmail("user@example.com", testUsers));