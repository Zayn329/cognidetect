import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const listeners = []
let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => { listener(memoryState) })
}

export function toast({ ...props }) {
  const id = genId()
  const update = (props) => dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss() } },
  })
  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = React.useState(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])
  return { ...state, toast, dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }) }
}