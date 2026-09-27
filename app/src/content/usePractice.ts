import { useEffect, useState } from 'react'
import { getPractice, loadPractices } from './loader'

/**
 * Loads the practice sets for these topics. Returns 'ready' once they are all available
 * (getPractice then works for them), 'loading', or 'error' (e.g. offline before they were saved).
 */
export function usePracticeSets(topicKeys: string[]): 'ready' | 'loading' | 'error' {
  const missing = [...new Set(topicKeys)].filter((k) => !getPractice(k))
  const id = missing.join('|')
  const [state, setState] = useState<{ id: string; status: 'loading' | 'error' | 'done' }>({ id: '', status: 'loading' })
  useEffect(() => {
    if (!id) return
    let live = true
    loadPractices(id.split('|')).then(
      () => live && setState({ id, status: 'done' }),
      () => live && setState({ id, status: 'error' }),
    )
    return () => { live = false }
  }, [id])
  if (!missing.length) return 'ready'
  return state.id === id && state.status === 'error' ? 'error' : 'loading'
}
