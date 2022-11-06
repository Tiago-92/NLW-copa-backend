import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { poolRoutes } from './routes/pool';
import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { guessRoutes } from './routes/guess';
import { userlRoutes } from './routes/user';


async function bootstrap() {
   const fastify = Fastify({
      logger: true,      
   })

   // em produção isso precisa ser uma variável de ambiente, gerar hash em: https://www.md5hashgenerator.com/
   await fastify.register(jwt,{
      secret: 'nlwcopa'
   })

   await fastify.register(cors, {
      origin: true,
   })

   await fastify.register(poolRoutes)
   await fastify.register(authRoutes)
   await fastify.register(gameRoutes)
   await fastify.register(guessRoutes)
   await fastify.register(userlRoutes)

   await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()