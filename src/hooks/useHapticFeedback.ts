import WebApp from '@twa-dev/sdk'

type HapticFeedbackImpactType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'

export const useHapticFeedback = (impact: HapticFeedbackImpactType = 'medium'): void => {
    WebApp.HapticFeedback.impactOccurred(impact)
}
