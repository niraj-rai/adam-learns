import type { Topic } from '@/content/loader'
import { getSubject } from '@/content/loader'
import type { TopicProgress } from '@/stores/progress'

export type TopicStatus = 'new' | 'started' | 'mastered'

export function topicStatus(p: TopicProgress | undefined): TopicStatus {
  if (!p) return 'new'
  if (p.masteredAt) return 'mastered'
  return 'started'
}

/** First topic (in curriculum order) that is not yet mastered. */
export function nextRecommended(topics: Record<string, TopicProgress>, subjectId = 'chemistry'): Topic | undefined {
  const ordered = getSubject(subjectId)?.units.flatMap((u) => u.topics) ?? []
  return ordered.find((t) => t.core && !topics[t.key]?.masteredAt) ?? ordered.find((t) => !topics[t.key]?.masteredAt)
}

export function missingPrereqs(topic: Topic, topics: Record<string, TopicProgress>) {
  return topic.prerequisites.filter((k) => !topics[k]?.masteredAt && !topics[k]?.lessonDone)
}

export const STATUS_STYLE: Record<TopicStatus, { label: string; cls: string; emoji: string }> = {
  new: { label: 'Not started', cls: 'bg-muted text-muted-foreground', emoji: '⚪' },
  started: { label: 'In progress', cls: 'bg-warn-soft text-foreground', emoji: '🟡' },
  mastered: { label: 'Mastered', cls: 'bg-success-soft text-success', emoji: '🟢' },
}
