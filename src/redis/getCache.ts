import { createClient } from 'redis';

const getCache = async (apiName: string, input: string) => {
  const client: any = createClient();
  await client.connect();
  const key = `${apiName}-${input}`;
  const result = await client.get(key);
  if (result) {
    return JSON.parse(result);
  } else {
    return null;
  }
};

export default getCache;
