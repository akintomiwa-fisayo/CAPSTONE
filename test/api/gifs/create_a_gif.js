/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../../app');
const { users: { user } } = require('../samples');

describe('POST /gifs', () => {
  let sampleGif = false;

  before((done) => {
    console.log('Reading sample GIF...');
    fs.readFile(path.resolve(__dirname, '../../../samples/image.gif'), (err, data) => {
      if (err) {
        throw new Error("Couldn't read sample image");
      } else {
        sampleGif = data;
        done();
      }
    });
  });

  it('Should create a gif', (done) => {
    request(app).post('/gifs')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${user.token}`)
      .field('title', 'gif post title')
      .attach('image', sampleGif, 'image.gif')
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('gifId');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('createdOn');
        expect(body.data).to.contain.property('title');
        expect(body.data).to.contain.property('imageUrl');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
