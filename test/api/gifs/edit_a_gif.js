/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { gifs } } = require('../samples');

describe('PATCH /gifs/:id', () => {
  it('Should edit a gif title', (done) => {
    request(app).patch(`/gifs/${gifs.postId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'edited gif post title' })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('title');
        expect(body.data).to.contain.property('imageUrl');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
