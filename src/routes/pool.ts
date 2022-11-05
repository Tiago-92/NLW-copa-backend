import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { authenticate } from "../../plugins/authenticate";
import { prisma } from "../lib/prisma";

export async function poolRoutes(fastify: FastifyInstance) {
   fastify.get('/pools/count', async () => {
      const count = await prisma.pool.count()

      return(count)
   })

   fastify.post('/pools', async (request, reply) => {
      // validar campo "title", não pode ser nulo
      const createPoolBody = z.object({
         title: z.string(),
      })

      const { title } = createPoolBody.parse(request.body)

      // cria um código aleatório para cada bolão
      const generate = new ShortUniqueId({ length: 6})
      const code = String(generate()).toUpperCase();

      let ownerId = null;

      try {
         await request.jwtVerify()

         await prisma.pool.create({
            data: {
               title,
               code,
               ownerId: request.user.sub,

               // criar bolão e participante do bolão junto
               participants: {
                  create: {
                     userId: request.user.sub,
                  }
               }
            }
         })
      } catch {
         await prisma.pool.create({
            data: {
               title,
               code
            }
         })
      }

      return reply.status(201).send({ code })
   })

   fastify.post('/pools/join', {
      onRequest: [authenticate]
   }, async (request, reply) => {
      const joinPoolBody = z.object({
         code: z.string(),
      })

      const { code } = joinPoolBody.parse(request.body)

      const pool = await prisma.pool.findUnique({
         where: {
            code,
         },
         include: {
            participants: {
               where: {
                  userId: request.user.sub,
               }
            }
         }
      })

      if (!pool) {
         return reply.status(400).send({
            messase: 'Bolão não encontrado.'
         })
      }

      if (pool.participants.length > 0) {
         return reply.status(400).send({
            messase: 'Vocẽ já está participando desse bolão.'
         })
      }

      if (!pool.ownerId) {
         await prisma.pool.update({
            where: {
               id: pool.id,
            },
            data: {
               ownerId: request.user.sub,
            }
         })
      }

      await prisma.participant.create({
         data: {
            poolId: pool.id,
            userId: request.user.sub,
         }
      })

      return reply.status(201).send()
   })

   fastify.get('/pools', {
      onRequest: [authenticate]
   }, async (request) => {
      const pools = await prisma.pool.findMany({
         where: {
            participants: {
               // todos o participantes do bolão que tẽm pelo menos um usuário logado
               some: {
                  userId: request.user.sub,
               }
            }
         },
         include: {
            // quantos participantes no bolão.
            _count: {
               select: {
                  participants: true,
               }
            },

            // seleciona 4 participantes com o avatar para mostrar na interface do mobile
            participants: {
               select: {
                  id: true,

                  user: {
                     select: {
                        avatarUrl: true,
                     }
                  }
               },
               take: 4,
            },
            owner: {
               select: {
                  id: true,
                  name: true,
               }
            }
         },
      })

      return { pools }
   })

   fastify.get('/pools/:id', {
      onRequest: [authenticate],
   }, async (request) => {
      const getPoolParams = z.object({
         id: z.string(),
      })

      const { id } = getPoolParams.parse(request.params)

      const pool = await prisma.pool.findUnique({
         where: {
            id,
         },
         include: {
            // quantos participantes no bolão.
            _count: {
               select: {
                  participants: true,
               }
            },

            // seleciona 4 participantes com o avatar para mostrar na interface do mobile
            participants: {
               select: {
                  id: true,

                  user: {
                     select: {
                        avatarUrl: true,
                     }
                  }
               },
               take: 4,
            },
            owner: {
               select: {
                  id: true,
                  name: true,
               }
            }
         },
      })

      return { pool }
   })
}   