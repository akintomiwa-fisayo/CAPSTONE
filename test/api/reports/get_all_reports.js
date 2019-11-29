/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { admin } } = require('../samples');

describe('GET /reports', () => {
  it('Should get all reports', (done) => {
    request(app).get('/api/v1/reports')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${admin.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        for (let i = 0; i < body.data.length; i++) {
          expect(body.data[i]).to.contain.property('reportId');
          expect(body.data[i]).to.contain.property('contentType');
          expect(body.data[i]).to.contain.property('flag');
          expect(body.data[i]).to.contain.property('reason');
          expect(body.data[i]).to.contain.property('reporter').to.be.an('object');
          expect(body.data[i]).to.contain.property('reportedOn');
          expect(body.data[i]).to.have.any.keys('comment', 'article', 'gif').to.be.an('object');
        }
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
