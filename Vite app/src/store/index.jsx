import { createGlobalState } from 'react-hooks-global-state';

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  account: '0xa5d66dcab3d4f9778cb07ce49bf5efb42af5641e',
  connectedAccount: '',
  contractAddress: '0xf45f3c2c69555a3e2ba04a7c2f2dd7ff23433816'
});

export {
    setGlobalState,
    useGlobalState,
    getGlobalState,
};