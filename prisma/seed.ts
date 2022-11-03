import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// popular o db
async function main() {
   const user = await prisma.user.create({
      data: {
         name: 'John Doo',
         email: 'john.doo@gmail.com',
         avatarUrl: 'https://github.com/Tiago-92',
      }
   })

   const pool = await prisma.pool.create({
      data: {
         title: 'Exemple Pool',
         code: 'BOL123',
         ownerId: user.id,

         participants: {
            create: {
               userId: user.id
            }
         }
      }
   })

   await prisma.game.create({
      data: {
         date: '2022-11-02T12:00:00.876Z',
         firstTeamCoutryCode: 'DE',
         secondTeamCoutryCode: 'BR',
      }
   })

   await prisma.game.create({
      data: {
         date: '2022-11-02T12:00:23.876Z',
         firstTeamCoutryCode: 'BR',
         secondTeamCoutryCode: 'AR',

         guesses: {
            create: {
               firstTeamPoints: 2,
               secondTeamPoints: 1,

               participant: {
                  connect: {
                     userId_poolId: {
                        userId: user.id,
                        poolId: pool.id,
                     }
                  }
               }
            }
         }
      }
   })
}

main()
