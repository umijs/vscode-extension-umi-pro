import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

const actionCreator = actionCreatorFactory('counter');

const initState = {
  counter: 0,
};

const builder = new DvaModelBuilder(initState, 'upload');

builder
  .takeEvery(actionCreator('noParam'), function*() {
    //@ts-ignore
    yield call(console.log);
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .takeEvery(actionCreator('toManyEffects'), function*(_, { call, put, select }) {
    //@ts-ignore
    yield call(console.log);
  })
  .takeEvery(actionCreator('lackEffects'), function*(_, { put }) {
    //@ts-ignore
    yield call(console.log);
    yield put({});
  })
  .takeEvery(actionCreator('noEffects'), function*(_) {
    //@ts-ignore
    yield call(console.log);
    //@ts-ignore
    yield put({});
  })
  .takeEvery(actionCreator('correctEffects'), function*(_, { put, call }) {
    yield call(console.log);
    yield put({});
  });

export default builder.build();
