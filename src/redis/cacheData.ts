import ms from 'ms';
import { createClient } from 'redis';

const cacheData = async (apiName: string, input: string, result: any) => {
  const client: any = createClient();
  await client.connect();
  const expiry = '24h';

  const key = `${apiName}-${input}`;
  client.set(key, JSON.stringify(result), 'EX', ms(expiry) / 1000);
  return;
};

export default cacheData;
