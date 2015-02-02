var models  = require('../../models');
var debug = require('debug')('ballistic');
var ACCOUNT = {General:1, Asset: 2, Liability: 3, Investment: 4}

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.name || !req.body.type || (req.body.type == ACCOUNT.Investment && !req.body.interest)){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Account.create({ name: req.body.name, type: req.body.type, interest: req.body.interest}).then(function(account) {
      account.setUser(req.user);
      debug(account);
      res.send({success: true, account: account});
    });
  }
}

exports.list = function(req, res) {
  debug(req.body)
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    req.user.getAccounts().then(function(accounts) {
      debug(accounts);
      res.send({success: true, accounts: accounts});
    });
  }
}

exports.get = function(req, res) {
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    models.Account.find(req.params.id).then(function(account) {
      account.getTransactions().then(function(transactions) {
        generateStatistics(account, transactions, function(statistics){
          res.send({success: true, account: account, transactions: transactions, statistics: statistics});
        })
      });
    });
  }
}

function generateStatistics(account, transactions, callback){
  statistics = {};
  models.Transaction.sum('amount', { where: { AccountId:  account.id} }).then(function(sum) {
    console.log(sum);
    statistics.sum = sum;
    callback(statistics);
  })
}