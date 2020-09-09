import Router from 'koa-router';
import { Request } from 'koa';
import HDWalletProvider from '@truffle/hdwallet-provider';
import getWeb3 from './web3';
import IRelayHub from './IRelayHub.json';

const HUB_ADDRESS = '0xd216153c06e857cd7f72665e0af1d7d82172f494';

const router = new Router();

router.get('/', async (ctx, next) => {
  await next();

  ctx.body = 'Burner Factory relayer';
  ctx.status = 200;
});

router.post('/pre-relay', async (ctx, next) => {
  console.log('Pre-relay', ctx.request.body);
  await next();
  const { network, from, to, gasPrice, gasLimit, data } = ctx.request.body;

  const web3 = getWeb3(network);

  let _gasLimit = gasLimit;
  if (!_gasLimit) {
    const estimate = await web3.eth.estimateGas({ from, to, data });
    _gasLimit = estimate;
  }

  const relay = (web3.currentProvider as HDWalletProvider).getAddress(0);

  const contract = new web3.eth.Contract(IRelayHub as any, HUB_ADDRESS);
  const [nonce, balance] = await Promise.all([
    contract.methods.getNonce(from).call(),
    contract.methods.balanceOf(to).call(),
  ]);

  const canRelay = web3.utils.toBN(_gasLimit).lt(web3.utils.toBN(balance));

  ctx.body = {
    canRelay,
    gasLimit: _gasLimit,
    txFee: 70,
    nonce,
    relay,
    hub: HUB_ADDRESS,
  };
  ctx.status = 200;
});

router.post('/relay', async (ctx, next) => {
  console.log('Relay', ctx.request.body);
  await next();
  const { network, from, to, gasPrice, gasLimit, txFee, data, nonce, signature } = ctx.request.body;

  const web3 = getWeb3(network);

  const relay = (web3.currentProvider as HDWalletProvider).getAddress(0);

  const approvalData = '0x';

  const contract = new web3.eth.Contract(IRelayHub as any, HUB_ADDRESS);
  const _canRelay = await contract.methods.canRelay(relay, from, to, data, txFee, gasPrice, gasLimit, nonce, signature, approvalData).call();

  if (_canRelay.status !== '0') {
    console.error(_canRelay);
    throw new Error('canRelay failed');
  }

  const tx = contract.methods.relayCall(from, to, data, txFee, gasPrice, gasLimit, nonce, signature, approvalData).send({
    from: relay,
    gasPrice: '1100000000',
  });

  return new Promise((resolve, reject) => {
    tx.on('transactionHash', (txHash: string) => {
      ctx.body = {
        txHash,
      };
      ctx.status = 200;
      resolve();
    });

    tx.on('error', (error: any, receipt: any) => {
      console.error(error, receipt);
      ctx.body = {
        error: error.toString(),
      };
      ctx.status = 200;
      resolve();
    });
  });
});

export default router;
