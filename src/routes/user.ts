import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function userlRoutes(fastify: FastifyInstance) {
   fastify.get('/users/count', async () => {
      const count = await prisma.pool.count()

      return(count)
   })
}