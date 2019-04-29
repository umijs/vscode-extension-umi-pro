export default {
  namespace: 'user',
  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { put }) {
      yield put({
        type: 'save',
        payload: [],
      });
    },
    *fetchCurrent(_, { put }) {
      yield put({
        type: 'saveCurrentUser',
        payload: {},
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};
