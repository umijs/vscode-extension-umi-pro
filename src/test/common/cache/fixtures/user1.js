export default {
  namespace: 'user1',
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
