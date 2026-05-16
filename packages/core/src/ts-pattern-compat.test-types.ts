import { match } from 'ts-pattern'

import {
  AsyncData,
  type AsyncData as AsyncDataType,
  Option,
  type Option as OptionType,
  Result,
  type Result as ResultType,
} from './index'

const option: OptionType<number> = Option.Some(1)
const optionResult: string = match(option)
  .with({ _tag: 'Some' }, ({ value }) => `some: ${value}`)
  .with({ _tag: 'None' }, () => 'none')
  .exhaustive()

const result: ResultType<number, string> = Result.Ok(1)
const resultResult: string = match(result)
  .with({ _tag: 'Ok' }, ({ value }) => `ok: ${value}`)
  .with({ _tag: 'Error' }, ({ error }) => `error: ${error}`)
  .exhaustive()

const asyncData: AsyncDataType<number> = AsyncData.Done(1)
const asyncDataResult: string = match(asyncData)
  .with({ _tag: 'NotAsked' }, () => 'not asked')
  .with({ _tag: 'Loading' }, () => 'loading')
  .with({ _tag: 'Done' }, ({ value }) => `done: ${value}`)
  .exhaustive()

const asyncResultData: AsyncDataType<ResultType<number, string>> = AsyncData.Done(Result.Ok(1))
const nestedResult: string = match(asyncResultData)
  .with({ _tag: 'NotAsked' }, () => 'not asked')
  .with({ _tag: 'Loading' }, () => 'loading')
  .with({ _tag: 'Done', value: { _tag: 'Ok' } }, ({ value }) => `ok: ${value.value}`)
  .with({ _tag: 'Done', value: { _tag: 'Error' } }, ({ value }) => `error: ${value.error}`)
  .exhaustive()

void optionResult
void resultResult
void asyncDataResult
void nestedResult
