import { Link } from 'react-router-dom'
import { useTimeOfDay } from '../hooks/useTimeOfDay'

export default function PageFooter() {
  const timeOfDay = useTimeOfDay()
  return (
    <footer className="page-foot">
      <span>
        <Link to="/">← BACK TO THE {timeOfDay.label} ROAST</Link>
      </span>
      <span>© MMXXVI ZING HEALTHY TREATS</span>
    </footer>
  )
}
