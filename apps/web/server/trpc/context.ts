export type TrpcContext = Record<string, never>

export const createTrpcContext = async (): Promise<TrpcContext> => ({})
