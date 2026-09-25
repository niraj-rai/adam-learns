export const JOINTS = [
  { id: 'ball', name: 'Ball and socket', where: 'Shoulder, hip', emoji: '🟠', moves: 'In almost every direction, and rotates', range: 360 },
  { id: 'hinge', name: 'Hinge', where: 'Elbow, knee, fingers', emoji: '🚪', moves: 'Back and forth in one direction, like a door', range: 150 },
  { id: 'pivot', name: 'Pivot', where: 'Neck (between the first two vertebrae)', emoji: '🔄', moves: 'Turns from side to side', range: 160 },
  { id: 'gliding', name: 'Gliding', where: 'Wrist and ankle bones', emoji: '🛷', moves: 'Small sliding movements', range: 30 },
  { id: 'fixed', name: 'Fixed (immovable)', where: 'Skull, upper jaw', emoji: '🔒', moves: 'Does not move', range: 0 },
]

/**
 * Elbow angle (degrees between upper arm and forearm) from how contracted the biceps is (0–1).
 * The triceps does the opposite: when one contracts, the other relaxes.
 */
export const elbowAngle = (biceps: number) => Math.round(170 - biceps * 130)
export const triceps = (biceps: number) => 1 - biceps

export const BONES_ADULT = 206
export const BONES_BABY = 300
