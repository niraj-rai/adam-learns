import { Link, createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/components/layout/LegalPage'

export const Route = createFileRoute('/terms')({ component: TermsPage })

function TermsPage() {
  return (
    <LegalPage emoji="📜" title="Terms of use" updated="26 September 2026">
      <section>
        <h2>Free to learn</h2>
        <p>AdamLearns is completely free. It never asks for money, there are no subscriptions, no paid content, no advertising and no sign-up. Anyone can use it to learn, anywhere, on any device.</p>
      </section>
      <section>
        <h2>A learning aid, not a course</h2>
        <p>AdamLearns is designed to <b>support</b> learners with interactive lessons, labs and practice, and to help them track their progress. It is <b>not</b> official course material and does not replace your school's syllabus, textbooks or teachers.</p>
        <ul>
          <li>Lessons are organised IB MYP first and mapped to CBSE/NCERT chapters to help you find related material.</li>
          <li>AdamLearns is not affiliated with, or endorsed by, the International Baccalaureate Organization, CBSE or NCERT.</li>
        </ul>
      </section>
      <section>
        <h2>Content may contain mistakes</h2>
        <p>We work hard to keep the content accurate, but there may be mistakes. If something is confusing or doesn't match what you've been taught, <b>double-check with your course book or your teacher</b>. Your textbook and teacher always come first.</p>
      </section>
      <section>
        <h2>Try-at-home activities</h2>
        <p>Some lessons suggest simple experiments to try at home. Always do them with an adult's permission and supervision, and follow the safety notes.</p>
      </section>
      <section>
        <h2>Using the site</h2>
        <ul>
          <li>The site is provided “as is”, and features may change as it grows.</li>
          <li>You're welcome to use the content for personal learning. Please don't copy or republish it as your own.</li>
          <li>See the <Link to="/privacy" className="text-chem underline">Privacy policy</Link> for how your progress is stored (only on your device).</li>
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AdamLearns. All rights reserved.</p>
    </LegalPage>
  )
}
