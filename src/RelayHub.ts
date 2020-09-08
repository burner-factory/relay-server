import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import getWeb3 from './web3';
import IRelayHub from './IRelayHub.json';

const HUB_ADDRESS = '0xd216153c06e857cd7f72665e0af1d7d82172f494';

export default class RelayHub {
  private web3: Web3;
  private contract: any;
  private relayAddress: string;

  constructor(chainId: string) {
    this.web3 = getWeb3(chainId);
    this.contract = new this.web3.eth.Contract(IRelayHub as any, HUB_ADDRESS);
    this.relayAddress = (this.web3.currentProvider as HDWalletProvider).getAddress(0);
  }

  async maybeRegisterRelay() {
    const status = await this.contract.methods.getRelay(this.relayAddress).call();
    if (status.state === '1') {
      const receipt = await this.contract.methods.registerRelay('1', 'https://relay.burnerfactory.com/').send({
        from: this.relayAddress,
        gasPrice: '1000000000',
      });
      console.log(`Relayer registered (${receipt.transactionHash})`);
    }
  }
}
