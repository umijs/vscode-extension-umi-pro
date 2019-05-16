export default {
  namespace: 'user2',
  state: {
    list: [],
    currentUser: {},
  },

  effects: {},
  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};
