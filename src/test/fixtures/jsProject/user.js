import { query as queryUsers, queryCurrent } from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    *toManyEffects(payload, { put, call, select }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *lackEffects(_, { put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *correctEffects(_, { put, call }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *noEffects(_) {
      const response = yield call(queryCurrent);
      const res = yield select(data => data);
      console.log(res);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *noParams() {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *useAll() {
      yield all([
        call(queryCurrent),
        put({
          type: 'saveCurrentUser',
          payload: response,
        }),
      ]);
    },
  },
};
