import { connect, Provider, createStore } from "./redux";

const reducer = (state, { type, payload }) => {
    if (type === 'updateUser') {
        return {
            ...state,
            ...payload
        }

    } else {
        return state
    }
}

const initState = {
    user: { name: "mary" },
    group: { name: "前端组" }
}

const store = createStore(reducer, initState)

const App = () => {
    console.log("app渲染了");
    return (
        <Provider store={store} >
            <div>
                <One />
                <Two />
                <Three />
                <Four />
            </div>
        </Provider>
    )
}

const userConnect = state => ({ user: state.user })

const dispatchConnect = dispatch => ({ updateUser: attrs => dispatch({ "type": "updateUser", payload: attrs }) })

const User = connect(userConnect)(({ user }) => {
    console.log("User渲染了");
    return <span>{user.name}</span>
})

const UserModify = connect(userConnect, dispatchConnect)(({ updateUser, user }) => {
    console.log("UserModify渲染了");
    const onChange = (e) => {
        updateUser({ user: { name: e.target.value } })
    }
    return (
        <input value={user.name} onChange={e => onChange(e)} />
    )
})

const One = () => {
    console.log("老大渲染了");
    return (
        <div>我是老大，用户是：<User />
        </div>
    )
}

const Two = () => {
    console.log("老二渲染了");
    return (
        <div>我是老二<UserModify /></div>
    )
}

const Three = connect(state => ({ group: state.group }))(({ group }) => {
    console.log("老三渲染了");
    return (
        <div>我是老三，所属组是{group.name}</div>
    )
})

const Four = connect(
    state => ({ user: state.user }))
    (({ user, dispatch }) => {
        // const onClickEvent = () => { dispatch(fetchUser) }
        const onClickEvent = () => { dispatch({ type: "updateUser", payload: fetchUserPromise() }) }
        return (
            <div>
                <span>用户是：{user.name}</span>
                <button onClick={onClickEvent}>异步获取 user</button>
            </div>
        )
    })

// 模拟异步请求
const ajax = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: { user: { name: "hehe" } } })
        }, 2 * 1000)
    })
}

const fetchUserPromise = () => {
    return ajax().then(response => response.data)
}

const fetchUser = dispatch => {
    ajax().then(response => {
        dispatch({ type: "updateUser", payload: { user: response.data } })
    })
}
const root = document.querySelector("#root")
ReactDOM.render(<App />, root)

