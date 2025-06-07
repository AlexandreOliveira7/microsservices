import { ordersDockerImage } from '../images/orders';
import * as awsx from '@pulumi/awsx';
import { cluster } from '../cluster';

export const ordersService = new awsx.classic.ecs.FargateService(
  'fargate-orders',
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      container: {
        image: ordersDockerImage.ref,
        cpu: 256,
        memory: 512,
      },
    },
  },
);
