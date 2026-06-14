/**
 * useControls — keyboard/gamepad input stored in a ref.
 *
 * Deliberately NOT using React state so input changes never trigger re-renders.
 * The ref is read directly inside useFrame() every tick.
 */

import { useEffect, useRef } from 'react'

const KEY_MAP = {
  ArrowUp:    'forward',
  KeyW:       'forward',
  ArrowDown:  'back',
  KeyS:       'back',
  ArrowLeft:  'left',
  KeyA:       'left',
  ArrowRight: 'right',
  KeyD:       'right',
  Space:      'brake',
  ShiftLeft:  'boost',
}

const DEFAULT_STATE = {
  forward: false,
  back:    false,
  left:    false,
  right:   false,
  brake:   false,
  boost:   false,
}

export function useControls() {
  const keys = useRef({ ...DEFAULT_STATE })

  useEffect(() => {
    const onDown = (e) => {
      const action = KEY_MAP[e.code]
      if (action) {
        e.preventDefault()
        keys.current[action] = true
      }
    }

    const onUp = (e) => {
      const action = KEY_MAP[e.code]
      if (action) keys.current[action] = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    // Blur safety — release all keys if window loses focus
    const onBlur = () => { keys.current = { ...DEFAULT_STATE } }
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return keys
}
