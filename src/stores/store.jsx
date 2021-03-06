import config from "../config";
import async from 'async';
import {
  MAX_UINT256,
  SNACKBAR_ERROR,
  // SNACKBAR_TRANSACTION_RECEIPT,
  SNACKBAR_TRANSACTION_CONFIRMED,
  SNACKBAR_TRANSACTION_HASH,
  ERROR,
  GET_BALANCES,
  BALANCES_RETURNED,
  DEPOSIT,
  DEPOSIT_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  DEPOSIT_ALL,
  DEPOSIT_ALL_RETURNED,
  WITHDRAW_ALL,
  WITHDRAW_ALL_RETURNED,
  GET_BORROW_AMOUNT,
  BORROW_AMOUNT_RETURNED,
  GET_REPAY_AMOUNT,
  REPAY_AMOUNT_RETURNED,
  BORROW,
  BORROW_RETURNED,
  REPAY,
  REPAY_RETURNED,
  CLAIM,
  CLAIM_RETURNED,
  STAKE,
  STAKE_RETURNED,
  UNSTAKE,
  UNSTAKE_RETURNED,
  GET_MARKET_INFO,
  MARKET_INFO_RETURNED,
  ADD_MARKET,
  ADD_MARKET_RETURNED
} from '../constants';
import Web3 from 'web3';

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors";

const rp = require('request-promise');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    this.store = {
      assets: [],
      configAssets: [
        {
          id: 'USDT',
          name: 'USDT',
          symbol: 'USDT',
          description: 'USDT',
          erc20address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          balance: 0,
          depositedBalance: 0,
          decimals: 6,
        },
        {
          id: 'USDC',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD//C',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          balance: 0,
          depositedBalance: 0,
          decimals: 6,
        },
        {
          id: 'TUSD',
          name: 'TUSD',
          symbol: 'TUSD',
          description: 'TUSD',
          erc20address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'AAVE',
          name: 'AAVE',
          symbol: 'AAVE',
          description: 'AAVE',
          erc20address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'SNX',
          name: 'Synthetix',
          symbol: 'SNX',
          description: 'Synthetix',
          erc20address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'LINK',
          name: 'ChainLink',
          symbol: 'LINK',
          description: 'ChainLink',
          erc20address: '0x514910771af9ca656af840dff83e8264ecf986ca',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'YFI',
          name: 'Yearn.finance',
          symbol: 'YFI',
          description: 'Yearn.finance',
          erc20address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'WETH',
          name: 'Wrapped Eth',
          symbol: 'WETH',
          description: 'Wrapped Eth',
          erc20address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        },
        {
          id: 'MKR',
          name: 'Maker',
          symbol: 'MKR',
          description: 'Maker',
          erc20address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
          balance: 0,
          depositedBalance: 0,
          decimals: 18,
        }
      ],
      scAsset: {
        id: 'xiii',
        name: 'Stable Credit',
        symbol: 'xiii',
        description: 'Stable Yield Credit',
        erc20address: config.stableCreditProtocolAddress,
        balance: 0,
        stakedBalance: 0,
        claimableBalance: 0,
        decimals: 8
      },
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
      },
      account: {},
      web3context: null
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_BALANCES:
            this.getBalances(payload);
            break
          case DEPOSIT:
            this.deposit(payload);
            break
          case WITHDRAW:
            this.withdraw(payload);
            break
          case DEPOSIT_ALL:
            this.depositAll(payload);
            break
          case WITHDRAW_ALL:
            this.withdrawAll(payload);
            break
          case GET_BORROW_AMOUNT:
            this.getBorrowAmount(payload);
            break
          case GET_REPAY_AMOUNT:
            this.getRepayAmount(payload);
            break
          case BORROW:
            this.borrow(payload);
            break
          case REPAY:
            this.repay(payload);
            break
          case STAKE:
            this.stake(payload);
            break
          case UNSTAKE:
            this.unstake(payload);
            break
          case CLAIM:
            this.claim(payload);
            break
          case GET_MARKET_INFO:
            this.getMarketInfo(payload);
            break
          case ADD_MARKET:
            this.addMarket(payload)
            break
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated');
  };

  _checkApproval = async (asset, account, amount, contract, callback) => {
    if(asset.erc20address === 'Ethereum') {
      return callback()
    }

    try {
      const web3 = await this._getWeb3Provider()
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      let ethAllowance = web3.utils.fromWei(allowance, "ether")
      if (asset.decimals !== 18) {
        ethAllowance = (allowance*10**asset.decimals).toFixed(0);
      }

      var amountToSend = MAX_UINT256

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        await erc20Contract.methods.approve(contract, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }

    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApprovalWaitForConfirmation = async (asset, account, amount, contract, callback) => {
    try {
      const web3 = await this._getWeb3Provider()
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      const ethAllowance = web3.utils.fromWei(allowance, "ether")

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      } else {
        callback()
      }
    } catch(error) {
     if(error.message) {
       return callback(error.message)
     }
     callback(error)
   }
  }

  getBalances = async () => {
    const account = store.getStore('account')
    const scAsset = store.getStore('scAsset')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();

    this._getMarkets(web3, (err, assets) => {

      async.parallel([
        (cb) => {
          async.map(assets, (asset, callback) => {
            async.parallel([
              (callbackInner) => { this._getERC20Balance(web3, asset, account, callbackInner) },
              (callbackInner) => { this._getCreditBalances(web3, asset, account, callbackInner) },
              (callbackInner) => { this._getDepositedBalance(web3, asset, account, callbackInner) },
              (callbackInner) => { this._getPrice(web3, asset, callbackInner) }
            ], (err, data) => {
              if(err) {
                return callback(err)
              }

              asset.balance = data[0]
              asset.creditBalance = data[1].balance
              asset.profit = data[1].profit
              asset.shortFall = data[1].shortFall
              asset.depositedBalance = data[2]
              asset.price = data[3]

              callback(null, asset)
            })
          }, (err, assets) => {
            if(err) {
              return cb(err)
            }

            cb(null, assets)
          })
        },
        (cb) => {
          async.parallel([
            (callbackInner) => { this._getERC20Balance(web3, scAsset, account, callbackInner) },
            (callbackInner) => { this._getStakedBalance(web3, scAsset, account, callbackInner) },
            (callbackInner) => { this._getClaimableBalance(web3, scAsset, account, callbackInner) },
          ], (err, data) => {
            if(err) {
              return cb(err)
            }

            scAsset.balance = data[0]
            scAsset.stakedBalance = data[1]
            scAsset.claimableBalance = data[2]

            cb(null, scAsset)
          })
        }
      ], (err, datas) => {
        if(err) {
          emitter.emit(SNACKBAR_ERROR, err)
          return emitter.emit(ERROR, err)
        }

        const credit = datas[0].reduce((accumulator, asset) => {
          return accumulator + (asset.creditBalance ? asset.creditBalance : 0)
        }, 0)
        datas[1].creditBalance = credit

        const deposited = datas[0].reduce((accumulator, asset) => {
          return accumulator + (asset.depositedBalance ? asset.depositedBalance : 0)
        }, 0)
        datas[1].depositedBalance = deposited
        store.setStore({ assets: datas[0] })
        store.setStore({ scAsset: datas[1] })

        return emitter.emit(BALANCES_RETURNED)
      })

    });
  }

  _getMarkets = async (web3, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    const markets = await stableCreditProtocolContract.methods.markets().call()
    const configAssets = store.getStore('configAssets')

    const assets = markets.map(async (market) => {
      let foundMarket = configAssets.filter((ca) => {
        return ca.erc20address.toLowerCase() === market.toLowerCase()
      })

      if(foundMarket && foundMarket.length > 0) {
        return foundMarket[0]
      } else {
        try {
          const erc20Contract = new web3.eth.Contract(config.erc20ABI, market)

          const symbol = await erc20Contract.methods.symbol().call();
          const name = await erc20Contract.methods.name().call();
          const decimals = await erc20Contract.methods.decimals().call();

          return {
            erc20address: market,
            id: symbol,
            symbol: symbol,
            name: name,
            description: name,
            decimals: decimals,
            balance: 0,
            depositedBalance: 0,
          }

        } catch(ex) {
          console.log(ex)

          console.log(market)

          return {
            erc20address: market,
            id: 'N/A',
            symbol: 'N/A',
            name: 'N/A',
            description: 'N/A',
            decimals: 18,
            balance: 0,
            depositedBalance: 0,
          }
        }
      }
    })

    Promise.all(assets).then((values) => {
      callback(null, values)
    });
  }

  _getERC20Balance = async (web3, asset, account, callback) => {

    if(asset.erc20address === 'Ethereum') {
      try {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(account.address), "ether");
        callback(null, parseFloat(eth_balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    } else {
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**asset.decimals
        callback(null, parseFloat(balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    }
  }

  _getDepositedBalance = async (web3, asset, account, callback) => {
    try {
      const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

      var balance = await stableCreditProtocolContract.methods.collateralBalanceOf(account.address, asset.erc20address).call({ from: account.address });
      callback(null, parseFloat(balance)/10**asset.decimals)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getPrice = async (web3, asset, callback) => {
    try {
      const scDecimals = store.getStore('scAsset').decimals
      const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

      var price = await stableCreditProtocolContract.methods.getPriceOracle(asset.erc20address).call();
      callback(null, parseFloat(price)/10**scDecimals)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getCreditBalances = async (web3, asset, account, callback) => {
    try {
      const scDecimals = store.getStore('scAsset').decimals
      const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

      const balance = await stableCreditProtocolContract.methods.collateralCredit(account.address, asset.erc20address).call({ from: account.address });
      const shortFall = await stableCreditProtocolContract.methods.shortFall(asset.erc20address, account.address, balance).call({ from: account.address });
      const profit = await stableCreditProtocolContract.methods.profit(asset.erc20address, account.address, balance).call({ from: account.address });
      callback(null, {
        balance: parseFloat(balance)/10**scDecimals,
        profit: parseFloat(profit)/10**scDecimals,
        shortFall: parseFloat(shortFall)/10**scDecimals,
      })
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getStakedBalance = async (web3, asset, account, callback) => {
    try {
      const scDecimals = store.getStore('scAsset').decimals
      const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

      var balance = await stableCreditProtocolContract.methods.stakes(account.address).call({ from: account.address });
      callback(null, parseFloat(balance)/10**scDecimals)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getClaimableBalance = async (web3, asset, account, callback) => {
    try {
      const scDecimals = store.getStore('scAsset').decimals
      const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

      var balance = await stableCreditProtocolContract.methods.earned(account.address).call({ from: account.address });
      callback(null, parseFloat(balance)/10**scDecimals)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  deposit = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      this._checkApproval(asset, account, amount, config.stableCreditProtocolAddress, (err) => {
        if(err) {
          emitter.emit(ERROR, err);
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        const amountToSend = (amount*10**asset.decimals).toFixed(0)

        this._deposit(web3, account, asset.erc20address, amountToSend, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(DEPOSIT_RETURNED)
        })
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _deposit = async (web3, account, assetAddress, amountToSend, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.deposit(assetAddress, amountToSend, 0, 0).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  withdraw = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const scDecimals = store.getStore('scAsset').decimals
      const web3 = await this._getWeb3Provider();

      const amountToSend = (amount*10**scDecimals).toFixed(0)

      this._withdraw(web3, account, asset.erc20address, amountToSend, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(WITHDRAW_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _withdraw = async (web3, account, assetAddress, amountToSend, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.withdraw(assetAddress, amountToSend, MAX_UINT256).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  depositAll = async (payload) => {
    try {
      const { asset } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      const amount = MAX_UINT256

      this._checkApproval(asset, account, amount, config.stableCreditProtocolAddress, (err) => {
        if(err) {
          emitter.emit(ERROR, err);
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        this._depositAll(web3, account, asset.erc20address, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(DEPOSIT_ALL_RETURNED)
        })
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _depositAll = async (web3, account, assetAddress, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.depositAll(assetAddress, 0, 0).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  withdrawAll = async (payload) => {
    try {
      const { asset } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      this._withdrawAll(web3, account, asset.erc20address, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(WITHDRAW_ALL_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _withdrawAll = async (web3, account, assetAddress, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.withdrawAll(assetAddress, MAX_UINT256).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  getBorrowAmount = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const scDecimals = store.getStore('scAsset').decimals
      const web3 = await this._getWeb3Provider();

      const assetAddress = asset.erc20address
      const amountToSend = (amount*10**asset.decimals).toFixed(0)
      const stableCreditHelperContract = new web3.eth.Contract(config.stableCreditHelperABI, config.stableCreditHelperAddress)

      const price = await stableCreditHelperContract.methods.calculateBorrowExactOut(assetAddress, amountToSend).call({ from: account.address })

      const returnObj = {
        sendAmount: amount,
        price: price,
        returnPrice: price/10**scDecimals,
        receivePerSend: (price*10**asset.decimals)/(amountToSend*10**scDecimals),
        sendPerReceive: (amountToSend*10**scDecimals)/(price*10**asset.decimals),
      }

      emitter.emit(BORROW_AMOUNT_RETURNED, returnObj)
    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  getRepayAmount = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const scDecimals = store.getStore('scAsset').decimals
      const web3 = await this._getWeb3Provider();

      const assetAddress = asset.erc20address
      const amountToSend = (amount*10**asset.decimals).toFixed(0)
      const stableCreditHelperContract = new web3.eth.Contract(config.stableCreditHelperABI, config.stableCreditHelperAddress)

      const price = await stableCreditHelperContract.methods.calculateRepayExactIn(assetAddress, amountToSend).call({ from: account.address })

      const returnObj = {
        sendAmount: amount,
        price: price,
        returnPrice: price/10**scDecimals,
        receivePerSend: (price*10**asset.decimals)/(amountToSend*10**scDecimals),
        sendPerReceive: (amountToSend*10**scDecimals)/(price*10**asset.decimals),
      }

      emitter.emit(REPAY_AMOUNT_RETURNED, returnObj)
    } catch(ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  borrow = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      const assetAddress = asset.erc20address
      const amountToReceive = (amount*10**asset.decimals).toFixed(0)
      const stableCreditHelperContract = new web3.eth.Contract(config.stableCreditHelperABI, config.stableCreditHelperAddress)

      let amountToSend = await stableCreditHelperContract.methods.calculateBorrowExactOut(assetAddress, amountToReceive).call({ from: account.address })
      // amountToSend = (amountToSend*1.01).toFixed(0)

      this._borrow(web3, account, asset.erc20address, amountToSend, amountToReceive, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(BORROW_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _borrow = async (web3, account, assetAddress, amountToSend, amountToReceive, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.borrowExactOut(assetAddress, amountToSend, amountToReceive).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  repay = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      const assetAddress = asset.erc20address
      const amountToSend = (amount*10**asset.decimals).toFixed(0)
      const stableCreditHelperContract = new web3.eth.Contract(config.stableCreditHelperABI, config.stableCreditHelperAddress)

      let amountToReceive = await stableCreditHelperContract.methods.calculateRepayExactIn(assetAddress, amountToSend).call({ from: account.address })
      // amountToReceive = (amountToReceive*0.99).toFixed(0)

      this._checkApproval(asset, account, amount, config.stableCreditProtocolAddress, (err) => {
        if(err) {
          emitter.emit(ERROR, err);
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        this._repay(web3, account, asset.erc20address, amountToSend, amountToReceive, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(REPAY_RETURNED)
        })
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _repay = async (web3, account, assetAddress, amountToSend, amountToReceive, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.repayExactIn(assetAddress, amountToSend, amountToReceive).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  claim = async (payload) => {
    try {
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      this._claim(web3, account, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(CLAIM_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _claim = async (web3, account, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.getReward().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  stake = async (payload) => {
    try {
      const { asset } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      this._checkApproval(asset, account, asset.balance, config.stableCreditProtocolAddress, (err) => {
        if(err) {
          emitter.emit(ERROR, err);
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        const amountToSend = (asset.balance*10**asset.decimals).toFixed(0)

        this._stake(web3, account, amountToSend, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(STAKE_RETURNED)
        })
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _stake = async (web3, account, amountToSend, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.stake(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  unstake = async (payload) => {
    try {
      const { asset } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      const amountToSend = (asset.stakedBalance*10**asset.decimals).toFixed(0)

      this._unstake(web3, account, amountToSend, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(UNSTAKE_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _unstake = async (web3, account, amountToSend, callback) => {
    const stableCreditProtocolContract = new web3.eth.Contract(config.stableCreditProtocolABI, config.stableCreditProtocolAddress)

    stableCreditProtocolContract.methods.unstake(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber === 1) {
        emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt.transactionHash)

        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
      }
    })
    .on('receipt', function(receipt){
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  getMarketInfo = async (payload) => {
    const account = store.getStore('account')
    const { address } = payload.content

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();

    try {
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, address)

      const balanceOf = await erc20Contract.methods.balanceOf(account.address).call()
      const decimals = await erc20Contract.methods.decimals().call()
      const symbol = await erc20Contract.methods.symbol().call()

      const asset = {
        erc20address: address,
        id: symbol,
        symbol: symbol,
        decimals: decimals,
        balance: balanceOf/10**decimals
      }

      emitter.emit(MARKET_INFO_RETURNED, asset)

    } catch(ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  addMarket = async (payload) => {
    try {
      const { asset, amount } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider();

      this._checkApproval(asset, account, amount, config.stableCreditProtocolAddress, (err) => {
        if(err) {
          emitter.emit(ERROR, err);
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        const amountToSend = (amount*10**asset.decimals).toFixed(0)

        this._deposit(web3, account, asset.erc20address, amountToSend, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(ADD_MARKET_RETURNED)
        })
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')

    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider);

    return web3
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
