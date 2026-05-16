import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createTrpcContext } from '../../../../server/trpc/context'
import { appRouter } from '../../../../server/trpc/root'

const handler = (request: Request) =>
  fetchRequestHandler({
    createContext: createTrpcContext,
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
  })

export { handler as GET, handler as POST }
