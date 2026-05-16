import { createTrpcContext } from './context'
import { createCaller } from './root'

export type ServerTrpcCaller = ReturnType<typeof createCaller>

export const createServerTrpcCaller = async (): Promise<ServerTrpcCaller> =>
  createCaller(await createTrpcContext())
