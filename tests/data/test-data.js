import { faker } from '@faker-js/faker';

export function adminCredentials() {
  return {
    username: "admin",
    password: "admin",
  };
}

export function visitorCredentials() {
  return {
    username: "guest",
    password: "guest",
  };
}

function invalidCredentials() {
  return {
    username: "guest!!!!!",
    password: "guest",
  };
}

export function IDs() {
  return {
    userID: '5',
    bookingID: '89',
    markerID: '163'
  }
}

export function randomUserID(){
 return faker.datatype.uuid();
}

module.exports = {
  adminCredentials,
  visitorCredentials,
  invalidCredentials,
  IDs,
  randomUserID
};
