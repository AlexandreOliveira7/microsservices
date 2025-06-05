import '@opentelemetry/auto-instrumentations-node/register';
import '../broker/subscriber.ts';
import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, {
  origin: '*',
});

app.get('/health', () => {
  return 'ok';
});

app
  .listen({
    host: '0.0.0.0',
    port: 3334,
  })
  .then(() => {
    console.log('[invoices] server running');
  });
