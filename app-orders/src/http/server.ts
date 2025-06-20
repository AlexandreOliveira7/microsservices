import '@opentelemetry/auto-instrumentations-node/register';
import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { trace } from '@opentelemetry/api';
import { setTimeout } from 'node:timers/promises';
import { db } from '../db/client.ts';
import { schema } from '../db/schema/index.ts';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';
import { tracer } from '../tracer/tracer.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, {
  origin: '*',
});

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('[orders] server running');
  });

app.get('/health', () => {
  return 'ok';
});

app.post(
  '/orders',
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;
    console.log('Creating order with amount', amount);

    const orderId = randomUUID();

    await db.insert(schema.orders).values({
      id: orderId,
      customerId: 'b22599e8-48d5-44c9-b5e9-945c6609f90f',
      amount,
    });

    const span = tracer.startSpan('aqui está demorando');

    span.setAttribute('teste', 'testando');

    await setTimeout(2000);

    span.end();

    trace.getActiveSpan()?.setAttribute('order_id', orderId);

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: 'b22599e8-48d5-44c9-b5e9-945c6609f90f',
      },
    });

    return reply.status(201).send();
  },
);
