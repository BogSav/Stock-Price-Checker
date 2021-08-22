'use strict';

module.exports = function (app) {

  const mongoose = require('mongoose');
  const fetch = require('node-fetch');

  mongoose.connect(
    process.env['MONGO_URI'],
    { useNewUrlParser : true, useUnifiedTopology : true }
  );

  const symbolSchema = new mongoose.Schema({
    symbol : String,
    likes : Number,
    ips : [String]
  });

  let Symbol = mongoose.model('Symbol', symbolSchema);

  function getObject(symbol, like, ip){
    return new Promise(resolve => {
      fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`)
      .then(res => res.json())
      .then(stockData => {
        let object = {stockData : {}};
        
        if (stockData != "Invalid symbol"){
          object['stockData']['stock'] = symbol;
          object['stockData']['price'] = stockData['latestPrice'];
        }
        
        Symbol.findOne((err, data) => {
          if(err)
            return console.error(err);

          if(!data){
            let document = Symbol({
              symbol : symbol,
              likes : 0,
              ips : []
            });

            if(like === 'true'){
              document.likes++;
              document.ips.push(ip);
            }

            object['stockData']['likes'] = document.likes;
            
            document.save((err, _) => {
              if(err)
                return console.error(err);
              resolve(object);
            });
          }
          else{
            if(like === 'true' && data.ips.indexOf(ip) == -1){
              data.ips.push(ip);
              data.likes++;
              object['stockData']['likes'] = data.likes;
              data.save((err, _) => {
                if(err)
                  return console.error(err);
                resolve(object);
              });
            }
            else{
              object['stockData']['likes'] = data.likes;
              resolve(object);
            }
          }
        });
      });
    });
  };

  async function asyncFuncCall1(symbol, like, ip, res){
    symbol = symbol.toUpperCase();
    return res.json(await getObject(symbol, like, ip));
  }

  async function asyncFuncCall2(symbol, like, ip, res){
    symbol.forEach(obj => obj = obj.toUpperCase());

    let [obj1, obj2] = [await getObject(symbol[0], like, ip), await getObject(symbol[1], like, ip)];

    let obj = {stockData : []};

    obj['stockData'].push({
      rel_likes : obj2['stockData']['likes'] - obj1['stockData']['likes'], 
      price : obj1['stockData']['price'],
      stock :  obj1['stockData']['stock']
      });

    obj['stockData'].push({
      rel_likes : obj1['stockData']['likes'] - obj2['stockData']['likes'], 
      price : obj2['stockData']['price'],
      stock :  obj2['stockData']['stock']
      });

    return res.json(obj)
  }

  app.route('/api/stock-prices')
    .get(function (req, res){
      let like = req.query.like;
      let ip = String(req.ip);
      let symbol = req.query.stock;

      if(!Array.isArray(req.query.stock))
        asyncFuncCall1(symbol, like, ip, res);
      else
        asyncFuncCall2(symbol, like, ip, res);
    });
};
