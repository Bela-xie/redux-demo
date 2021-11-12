// 课程来源：https://www.bilibili.com/video/BV1254y1L7UP?p=1

const { useState, createContext, useEffect } = React

// 把变量从 store 中提出来是为了隐藏这些变量，不向使用者暴露
let state = undefined
let reducer = undefined
let listeners = []
const setState = (newState) => {
    state = newState
    listeners.forEach(fn => {
        fn(state)
    })
}
const store = {
    getState: () => {
        return state
    },

    subscribe(fn) {
        listeners.push(fn)
        return () => {
            const index = listeners.indexOf(fn)
            listeners.splice(index, 1)
        }
    },
    dispatch(action) {
        setState(reducer(state, action))
    }
}

let dispatch = store.dispatch
// 让 action 支持函数，仿制中间件 redux-thunk
// const previousDispatch = dispatch
// dispatch = (action) => {
//     if (typeof action === 'function') {
//         action(dispatch)
//     } else {
//         previousDispatch(action)
//     }
// }

// 让 payload 支持 Promise 调用，仿制中间件 redux-promise
const previousDispatch2 = dispatch
dispatch = (action) => {
    if (action.payload instanceof Promise) {
        action.payload.then(data => {
            dispatch({ ...action, payload: data })
        })
    } else {
        previousDispatch2(action)
    }
}

export const createStore = (_reducer, initState) => {
    state = initState
    reducer = _reducer
    return store
}

const changed = (oldState, newState) => {
    let changed = false
    for (const key in oldState) {
        if (oldState[key] !== newState[key]) {
            changed = true
        }
    }
    return changed
}

export const connect = (selector, dispatchSelector) => (Component) => {
    return (props) => {
        const data = selector ? selector(state) : { state }
        const dispatchers = dispatchSelector ? dispatchSelector(dispatch) : { dispatch }
        const [, update] = useState({})
        useEffect(() => {
            store.subscribe(() => {
                const newData = selector ? selector(state) : { state: state }
                if (changed(data, newData)) {
                    update({})
                }
            })
        }, [])
        return <Component {...props} {...dispatchers} {...data} />
    }
}

const AppContext = createContext(null)

export const Provider = ({ store, children }) => {
    return (
        <AppContext.Provider value={store} >
            {children}
        </AppContext.Provider>
    )
}