export function withMixin(model) {
  if (!model) {
    throw new Error('model cannot be empty')
  }

  const mixed = {}

  if (model.namespace) {
    mixed.namespace = model.namespace
  }
  mixed.state = model.state
  mixed.subscriptions = model.subscriptions
  mixed.effects = model.effects
  mixed.reducers = Object.assign(
    {
      // 更新状态
      updateState(state, { payload }) {
        return {
          ...state,
          ...payload
        }
      }
    },
    model.reducers
  )

  return mixed
}
