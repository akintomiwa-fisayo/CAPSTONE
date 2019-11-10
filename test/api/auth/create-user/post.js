/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = require('../../../../app');
const testDb = require('../../../../testDb');
const dbconn = require('../../../../dbconn');

describe('POST /auth/create-user', () => {
  const admin = {
    id: 1065,
    firstName: 'name',
    lastName: 'name',
    email: 'admin@gmail.com',
    password: '$2b$10$NJKkups9jG6D4ZV7s8y7tOtvtuR5jgtPA6xuJgGzx2Xf3rnrNOIky',
    gender: 'male',
    jobRole: 'j1001',
    department: 'd1002',
    address: 'address',
    passport: 'https://res.cloudinary.com/capstone-backend/image/upload/v1573054820/gkascktgwbavuemvjy4v.jpg',
  };
  admin.token = jwt.sign({
    userId: admin.id,
    email: admin.email,
  }, process.env.USERS_TOKEN_SECRET, {
    expiresIn: '24h',
  });

  const user = {
    ...admin,
    id: 1067,
    email: 'user@gmail.com',
    jobRole: 'j1003',
    department: 'd1002',
  };
  user.token = jwt.sign({
    userId: user.id,
    email: user.email,
  }, process.env.USERS_TOKEN_SECRET, {
    expiresIn: '24h',
  });

  let sampleImage;

  before((done) => {
    testDb.build().then(() => {
      // Insert required data into table
      console.log('Inserting required data into "users" table...');
      dbconn.query(`\
        INSERT INTO users ("user_id", "passport_url", "first_name", "last_name", "email", "password", "gender", "job_role", "department", "address", "token")\
        VALUES\
        (\
          '${admin.id}',
          '${admin.passport}',
          '${admin.firstName}',
          '${admin.lastName}',
          '${admin.email}',
          '${admin.password}',
          '${admin.gender}',
          '${admin.jobRole}',
          '${admin.department}',
          '${admin.address}',
          '${admin.token}'
        ),
        (
          '${user.id}',
          '${user.passport}',
          '${user.firstName}',
          '${user.lastName}',
          '${user.email}',
          '${user.password}',
          '${user.gender}',
          '${user.jobRole}',
          '${user.department}',
          '${user.address}',
          '${user.token}'
        )
      `).then(() => {
        console.log('  - Inserted data into "users" table successfully\n');
        console.log('Reading sample image...');
        fs.readFile(path.resolve(__dirname, '../../../../samples/image.jpg'), (err, data) => {
          if (err) {
            throw new Error("Couldn't read sample image");
          } else {
            console.log('  - Read sample image');
            sampleImage = data;
            done();
          }
        });
      }).catch((error) => {
        console.log('  - Failed inserting data into "users" table', error);
        done();
      });
    }).catch((error) => {
      console.log('Failed to build test database', error);
      done();
    });
  });

  after((done) => {
    testDb.destroy().then(() => {
      done();
      if (process.env.TEST_ENV === 'CI') process.exit();
    }).catch((error) => {
      console.log('Failed to destroy test database', error);
      done();
    });
  });


  it('Should create new employee account', (done) => {
    request(app).post('/auth/create-user')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${admin.token}`)
      .field('gender', 'male')
      .field('firstName', 'test')
      .field('lastName', 'fisayo')
      .field('jobRole', 'j1003')
      .field('department', 'd1002')
      .field('password', '12345678')
      .field('address', 'noo 30 street')
      .field('email', 'test1@gmail.com')
      .attach('passport', sampleImage, 'image.jpg')
      .then((res) => {
        const { body, status } = res;
        expect(body).to.contain.property('status').to.equal('success');
        // console.log('STATUS RECIEVE : ', status);
        // console.log('BODY RECIEVE : ', body);
        expect(status).to.equal(201);
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('token');
        expect(body.data).to.contain.property('userId');
        done();
        console.log('\n');
      })
      .catch((error) => done(error));
  }).timeout(6000);

  it('Should fail when user is not an admin', (done) => {
    request(app).post('/auth/create-user')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${user.token}`)
      .field('gender', 'male')
      .field('firstName', 'test2 which shouldnt be here')
      .field('lastName', 'fisayo')
      .field('jobRole', 'j1003')
      .field('department', 'd1002')
      .field('password', '12345678')
      .field('address', 'noo 30 street')
      .field('email', 'test2@gmail.com')
      .attach('passport', fs.readFileSync(path.resolve(__dirname, '../../../../samples/image.jpg')), 'image.jpg')
      .then((res) => {
        const { body } = res;
        expect(body).to.contain.property('status').to.equal('error');
        expect(body).to.contain.property('error');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
