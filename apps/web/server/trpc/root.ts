import { createCallerFactory, createTrpcRouter } from './init'
import { dealRouter } from './routers/deal-router'

export const appRouter = createTrpcRouter({
  deal: dealRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
