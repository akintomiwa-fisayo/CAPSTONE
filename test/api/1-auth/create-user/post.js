/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../../../app');
const dbconn = require('../../../../dbconn');
const { users: { user, admin } } = require('../../../samples');

describe('POST /auth/create-user', () => {
  let sampleImage;

  before((done) => {
    console.log('Inserting data into "users" table...');
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
      console.log('Reading sample image...');
      fs.readFile(path.resolve(__dirname, '../../../../samples/image.jpg'), (err, data) => {
        if (err) {
          throw new Error("Couldn't read sample image");
        } else {
          sampleImage = data;
          done();
        }
      });
    }).catch((error) => {
      console.log('  - Failed inserting data into "users" table', error);
      done();
    });
  });

  after((done) => {
    done();
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
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('token');
        expect(body.data).to.contain.property('userId');
        done();
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
