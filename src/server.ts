import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import router from './router';

const app = new Koa();
const port = process.env.PORT || 5555;

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on port ${port}`));

export default app;
