const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const fetch = require('node-fetch');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Viewing one stock', done => {
    chai.request(server)
      .get('/api/stock-prices/?stock=goog&like=false')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'likes');
        (async () => {
          const data = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/goog/quote');
          const obj = await data.json();

          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.price, obj.latestPrice);
          done();
        })()
      });
  })

  test('Viewing one stock and liking it', done => {
    chai.request(server)
      .get('/api/stock-prices/?stock=goog&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'likes');
        (async () => {
          const data = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/goog/quote');
          const obj = await data.json();

          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.price, obj.latestPrice);
          done();
        })()
      });
  });

  test('Viewing the same stock and liking it again', done => {
    chai.request(server)
      .get('/api/stock-prices/?stock=goog&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'likes');
        (async () => {
          const data = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/goog/quote');
          const obj = await data.json();

          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.price, obj.latestPrice);
          done();
        })()
      });
  })

  test('Viewing two stocks', function(done){
    chai.request(server)
      .get('/api/stock-prices/?stock=goog&stock=msft&like=false')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

  test('Viewing two stocks and liking them', function(done) {
    chai.request(server)
      .get('/api/stock-prices/?stock=a1234&stock=b1234&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);

        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      })
  });
});
