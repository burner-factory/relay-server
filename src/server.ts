import 'dotenv/config';
import HDWalletProvider from '@truffle/hdwallet-provider';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import chains from './chains';
import getWeb3 from './web3';
import RelayHub from './RelayHub';

import router from './router';

const app = new Koa();
const port = process.env.PORT || 5555;

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Listening on port ${port}`);

  const web3 = getWeb3('42');
  const relay = (web3.currentProvider as HDWalletProvider).getAddress(0);
  console.log('Relay account:', relay);
  chains.forEach(async (chain: any) => {
    const hub = new RelayHub(chain.id);
    hub.maybeRegisterRelay();
  });
});

export default app;
