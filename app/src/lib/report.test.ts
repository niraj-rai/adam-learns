import { describe, expect, it } from 'vitest'
import type { ReviewItem, TopicProgress } from '@/stores/progress'
import { needsAttention, recentActivity, subjectSummary, timeSummary } from './report'
import { EMPTY_TIME, credit } from './timeTracking'

const tp = (bestScore: number, lastSeen: string, extra: Partial<TopicProgress> = {}): TopicProgress => ({ lessonDone: true, bestScore, attempts: 1, lastSeen, ...extra })

const progress: Record<string, TopicProgress> = {
  a: tp(0.9, '2026-09-20', { masteredAt: '2026-09-20' }),
  b: tp(0.5, '2026-09-22'),
  c: tp(0, '2026-09-10', { attempts: 0 }), // lesson read, no practice yet
  x: tp(0.7, '2026-09-25'), // not in the list below
}
const review: Record<string, ReviewItem> = {
  'a#1': { topicKey: 'a', questionId: '1', box: 1, due: '2026-09-21' },
  'a#2': { topicKey: 'a', questionId: '2', box: 2, due: '2026-09-30' },
}

describe('report', () => {
  it('summarises a subject', () => {
    const s = subjectSummary([{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }], progress)
    expect(s).toEqual({ total: 4, mastered: 1, started: 2, notStarted: 1, avgBest: 0.7 })
    expect(subjectSummary([{ key: 'd' }], progress).avgBest).toBeNull()
  })

  it('lists topics that need attention, low scores first', () => {
    const list = needsAttention(progress, review, '2026-09-26')
    expect(list.map((x) => x.key)).toEqual(['b', 'x', 'a'])
    expect(list.find((x) => x.key === 'a')).toMatchObject({ due: 1, lowScore: false })
    expect(needsAttention(progress, review, '2026-09-20').map((x) => x.key)).toEqual(['b', 'x'])
  })

  it('shows recent activity newest first', () => {
    expect(recentActivity(progress, 3).map((x) => x.key)).toEqual(['x', 'b', 'a'])
  })

  it('summarises time spent', () => {
    let time = credit(EMPTY_TIME, { subject: 'chemistry', topicKey: 'a' }, 600, '2026-09-26')
    time = credit(time, { subject: 'physics', topicKey: 'b' }, 300, '2026-09-22')
    time = credit(time, { subject: 'chemistry', labId: 'lab' }, 120, '2026-09-14') // the week before
    time = credit(time, { other: 'home' }, 30, '2026-09-26')
    const s = timeSummary(time, '2026-09-26', ['chemistry', 'physics', 'biology'], 1)
    expect(s).toEqual({
      today: 630,
      week: 930,
      allTime: 1050,
      subjects: [
        { id: 'chemistry', week: 600, allTime: 720 },
        { id: 'physics', week: 300, allTime: 300 },
        { id: 'biology', week: 0, allTime: 0 },
      ],
      topTopics: [{ key: 'a', seconds: 600 }],
    })
    expect(timeSummary(EMPTY_TIME, '2026-09-26', []).allTime).toBe(0)
  })
})
