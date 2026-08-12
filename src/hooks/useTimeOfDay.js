import { useMemo } from 'react'

export function useTimeOfDay() {
  return useMemo(() => {
    const hour = parseInt(new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour: "numeric", hour12: false }), 10)
    if (hour >= 5 && hour < 12) return { label: 'MORNING', lower: 'morning', lines: ['MORNING'] }
    if (hour >= 12 && hour < 17) return { label: 'AFTERNOON', lower: 'afternoon', lines: ['AFTERNOON'] }
    if (hour >= 17 && hour < 21) return { label: 'EVENING', lower: 'evening', lines: ['EVENING'] }
    return { label: 'NIGHT', lower: 'night', lines: ['NIGHT'] }
  }, [])
}
