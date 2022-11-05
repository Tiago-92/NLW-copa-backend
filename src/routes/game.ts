import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../plugins/authenticate";
import { prisma } from "../lib/prisma";

export async function gameRoutes(fastify: FastifyInstance) {
   // listar games
   fastify.get('/pools/:id/games', {
      onRequest: [authenticate],
   }, async (request) => {
      const getPoolParams = z.object({
         id: z.string(),
      })

      const { id } = getPoolParams.parse(request.params)
      // listar todos os jogos
      const games = await prisma.game.findMany({
         // ordernar os jogos mais recentes
         orderBy: {
            date: 'desc',
         },
         // se o participante criou um palpite para o jogo, retorna um array com o palpite
         include: {
            guesses: {
               where: {
                  participant: {
                     userId: request.user.sub,
                     poolId: id,
                  }
               }
            }
         }
      })

      return {
         games: games.map(game => {
            return {
               ...game,
               guess: game.guesses.length > 0 ? game.guesses[0] : null,
               guesses: undefined,
               // um usuário pode fazer somente um palpite por jogo, o array vai mostrar o primeiro palpite
               // por isso o nome é guess, porque é só um palpite. 
            }
         })
       }
   })
}