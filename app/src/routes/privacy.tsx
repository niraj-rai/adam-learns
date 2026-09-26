import { Link, createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/components/layout/LegalPage'

export const Route = createFileRoute('/privacy')({ component: PrivacyPage })

function PrivacyPage() {
  return (
    <LegalPage emoji="🔒" title="Privacy policy" updated="26 September 2026">
      <section>
        <h2>In short</h2>
        <p><b>AdamLearns does not collect any personal data.</b> There are no accounts, no sign-in, no cookies, no analytics and no tracking. When you first visit we ask for your name and grade, only so the site can greet you and show the right topics: they are saved on your device and never sent anywhere. Everything you do stays on your own device.</p>
      </section>
      <section>
        <h2>What is stored, and where</h2>
        <p>To remember your learning, AdamLearns saves a few things in your browser's local storage, <b>on this device only</b>:</p>
        <ul>
          <li>your profile: first and last name, grade, and your skills-check results (strengths and warm-up topics);</li>
          <li>your study plan, if you make one: the days, start time, minutes per session and subjects you picked, and your reminder choices;</li>
          <li>your progress: topics started and mastered, practice scores, XP, badges and streak;</li>
          <li>your review queue and reflection answers;</li>
          <li>your settings: theme, sounds and whether the CBSE mapping is shown.</li>
        </ul>
        <p className="mt-2">This information is <b>never sent to us or to anyone else</b>. We can't see it, and we don't have a server that stores it.</p>
      </section>
      <section>
        <h2>Things to know</h2>
        <ul>
          <li>Progress doesn't move between devices or browsers by itself: each keeps its own. To move it, use <b>Export progress</b> on the Progress page to save a file, then <b>Import progress</b> on the other device. The file stays with you.</li>
          <li>Study reminders are played by this page in your browser. If you allow notifications, your browser shows them on this device; nothing is sent through a server, which is also why reminders only work while AdamLearns is open in a tab.</li>
          <li>Clearing your browser data (or using private browsing) erases your progress.</li>
          <li>You can reset your progress at any time from the <Link to="/progress" className="text-chem underline">Progress</Link> page, or by clearing this site's data in your browser. You can change your name and grade (or remove them) there too.</li>
        </ul>
      </section>
      <section>
        <h2>Hosting</h2>
        <p>The website files are served by GitHub Pages. Like any web host, GitHub may keep standard technical logs (such as IP addresses) to deliver and protect the service; see GitHub's own privacy statement. AdamLearns itself doesn't receive or use this information. All fonts and code are served from the same site; nothing is loaded from other companies.</p>
      </section>
      <section>
        <h2>Children</h2>
        <p>AdamLearns is made for students. Because it collects no personal data at all, children can use it safely without sharing any information about themselves.</p>
      </section>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AdamLearns.</p>
    </LegalPage>
  )
}
