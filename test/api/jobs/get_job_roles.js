/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');

describe('GET /jobs', () => {
  it('Should get all departments and jobs in them', (done) => {
    request(app).get('/jobs')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.be.an('object');
        let dept = null;
        let jobRole = null;
        Object.keys(body.data).forEach((deptId) => {
          dept = body.data[deptId];
          expect(dept).to.contain.property('name');
          expect(dept).to.contain.property('jobRoles').to.be.an('array');
          Object.keys(dept.jobRoles).forEach((i) => {
            jobRole = dept.jobRoles[i];
            expect(jobRole).be.an('object');
            expect(jobRole).to.contain.property('title');
            expect(jobRole).to.contain.property('id');
          });
        });
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
