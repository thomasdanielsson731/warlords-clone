import { useGameStore } from '../game/store'
import { TUTORIAL_STEPS, TUTORIAL_TOPICS } from '../game/tutorial'
import '../styles/TutorialPanel.css'

export default function TutorialPanel() {
  const tutorialStep = useGameStore((s) => s.tutorialStep)
  const tutorialDismissed = useGameStore((s) => s.tutorialDismissed)
  const dismissTutorial = useGameStore((s) => s.dismissTutorial)
  const turnNumber = useGameStore((s) => s.turnNumber)

  // Hide after turn 5 or if dismissed
  if (tutorialDismissed || turnNumber > 5) return null

  const currentStep = TUTORIAL_STEPS[tutorialStep] ?? null
  const allDone = tutorialStep >= TUTORIAL_STEPS.length

  return (
    <div className="tutorial-panel">
      <div className="tutorial-header">
        <span className="tutorial-title">📜 First Steps</span>
        <button className="tutorial-dismiss" onClick={dismissTutorial} title="Dismiss tutorial">✕</button>
      </div>

      {/* Current objective */}
      {currentStep && !allDone && (
        <div className="tutorial-objective">
          <span className="tutorial-obj-icon">{currentStep.icon}</span>
          <div className="tutorial-obj-text">
            <strong>{currentStep.title}</strong>
            <p>{currentStep.description}</p>
          </div>
        </div>
      )}

      {allDone && (
        <div className="tutorial-complete">
          <span className="tutorial-obj-icon">🎉</span>
          <div className="tutorial-obj-text">
            <strong>Tutorial Complete!</strong>
            <p>You know the basics. Now conquer the realm!</p>
          </div>
        </div>
      )}

      {/* Progress dots */}
      <div className="tutorial-progress">
        {TUTORIAL_STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`tutorial-dot${i < tutorialStep ? ' done' : i === tutorialStep ? ' active' : ''}`}
            title={step.title}
          />
        ))}
      </div>

      {/* Quick reference */}
      <div className="tutorial-topics">
        {TUTORIAL_TOPICS.map((topic) => (
          <div key={topic.title} className="tutorial-topic">
            <span className="topic-icon">{topic.icon}</span>
            <div className="topic-text">
              <strong>{topic.title}</strong>
              <p>{topic.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
