import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('[orders] server running');
  });

app.post(
  '/',
  {
    schema: {
      body: z.object({
        amount: z.number(),
      }),
    },
  },
  (request, reply) => {
    const { amount } = request.body;
    console.log('Creating order with amount', amount);

    return reply.status(201).send();
  },
);
