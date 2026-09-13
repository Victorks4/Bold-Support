import { useEffect, useState } from 'react'

export function useIsDesktopLoginPanel() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setShow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return show
}
