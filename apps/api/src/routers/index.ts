import { router } from '../trpc/utils'
import { authRouter } from './auth'
import { deckRouter } from './deck'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  deck: deckRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
