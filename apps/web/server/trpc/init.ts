import { initTRPC } from '@trpc/server'

import type { TrpcContext } from './context'

const t = initTRPC.context<TrpcContext>().create()

export const createCallerFactory = t.createCallerFactory
export const createTrpcRouter = t.router
export const publicProcedure = t.procedure
