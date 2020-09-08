interface Chain {
  id: string;
  rpc: string;
}

const chains: Chain[] = [
  {
    id: '42',
    rpc: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
  },
  {
    id: '5',
    rpc: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
  },
  {
    id: '100',
    rpc: 'https://xdai.poanetwork.dev/',
  },
];

export default chains;

export function getChain(id: string): Chain {
  for (const chain of chains) {
    if (chain.id === id.toString()) {
      return chain;
    }
  }
  throw new Error(`Couldn't find chain ${id}`);
}
