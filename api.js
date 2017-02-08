const _ = require('lodash')
const update = require('immutability-helper')
const { init, createEntity, deleteEntity, updateGameState, getGameState } = require('./utils')

module.exports = (componentNames) => ({

  reducers: {
    loadGameState: (state, { loadState }) => {
      return init(loadState)
    },

    createEntity: (state, { data }) => {
      const entity = createEntity(data)

      return updateGameState(state, {
        entities: {
          [entity.id]: { $set: entity }
        }
      })
    },

    deleteEntity: (state, { data }) => {
      const game = getGameState(state)

      return updateGameState(state, {
        entities: {
          $set: deleteEntity(data.id, game)
        }
      })
    },

    beginStep: (state) => {
      return update(state, {
        next: { $set: state.current },
        isGameStepCompleted: { $set: false }
      })
    },

    _completeStep: (state) => {
      if (state.isGameStepCompleted) {
        return state
      }

      return update(state, {
        prev: { $set: state.current },
        current: { $set: state.next },
        next: { $set: null },
        isGameStepCompleted: { $set: true }
      })
    }
  },

  effects: {
    completeStep: (state, data, send) => {
      _.forEach(componentNames, (name) => {
        send(`game:${name}.update`, {}, _.noop)
      })

      send('game:_completeStep', {}, _.noop)
    }
  }
})
