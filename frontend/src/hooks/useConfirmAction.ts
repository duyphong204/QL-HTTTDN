import { useCallback } from 'react'

interface ConfirmActionOptions {
  message: string
  action: () => Promise<void> | void
}

export const useConfirmAction = () => {
  const confirmAndRun = useCallback(async ({ message, action }: ConfirmActionOptions) => {
    if (!window.confirm(message)) {
      return false
    }

    await action()
    return true
  }, [])

  return { confirmAndRun }
}
