import NodeCache from 'node-cache';

const nodeCacheSingleton = () => {
  return new NodeCache({ stdTTL: 0, checkperiod: 0 });
};

declare global {
  var cache: undefined | ReturnType<typeof nodeCacheSingleton>; // eslint-disable-line
}

const cache = globalThis.cache ?? nodeCacheSingleton();

export default cache;

if (process.env.NODE_ENV !== 'production') globalThis.cache = cache;
