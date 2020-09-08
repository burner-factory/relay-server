import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { getChain } from './chains';

const getWeb3 = (network: string): Web3 => {
  const chainData = getChain(network);

  const innerProvider = new Web3.providers.HttpProvider(chainData.rpc);

  if (!process.env.MNEMONIC) {
    throw new Error('MNEMONIC env var not set');
  }

  // @ts-ignore
  const originalSend = innerProvider.send.bind(innerProvider);
  // @ts-ignore
  innerProvider.send = (payload: any, cb: any) => {
    // @ts-ignore
    delete payload.skipCache;
    return originalSend(payload, cb);
  };

  const provider = new HDWalletProvider(process.env.MNEMONIC, innerProvider, 0, 1, false);

  return new Web3(provider);
};

export default getWeb3;
