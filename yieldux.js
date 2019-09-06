module.exports = function createStore (reducer, initialState) {
  let state = initialState
  const listeners = []
  let lockPromise = null
  let unlock = null

   return {
    dispatch: async function(event) {
      while (Promise.resolve(lockPromise) === lockPromise) {
        await lockPromise
      }

      lockPromise = new Promise(function(resolve) {
        unlock = function() {
          lockPromise = null
          resolve()
        }
      })

      try {
        const generator = reducer(state, event)
        let lastValue = null
        while (true) {
          const { value, done } = generator.next(lastValue)
          if(Promise.resolve(value) === value) {
            lastValue = await value
          } else {
            lastValue = value
          }

          if (done) {
            state = lastValue
            break
          }
        }
      } finally {
        unlock()
      }

      for(let i=0; i<listeners.length; i++) {
        listeners[i](/*


        */)
      }
    },
    getState: function() {
      return state
    },
    subscribe: function() {
      listeners.push(listener)
      return function() {
        let index = -1
        for (let i=0; i<listeners.length; i++) {
          if(listeners[i] === listener) {
            index = i
            break
          }
        }
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }
}

const delay = (ms) => new Promise(
  resolve => setTimeout(resolve, ms)
)

function* reducer(state, action) {
  console.log('started', state)
  yield delay(100)
  console.log('100ms')
  yield delay(500)
  console.log('600ms')
  yield delay(500)
  console.log('1600ms')
  console.log('finished', state)
  state.value += action.payload.value
  return state
}

const state = { value : 0 }

const store = module.exports(reducer, state)

for(let i=0; i<10; i++) {
  store.dispatch({ type: 'qqq', payload: { value: 1 } })
}

console.log('@@@@@@@@@@', state)


