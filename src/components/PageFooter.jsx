import { Link } from 'react-router-dom'

export default function PageFooter() {
  return (
    <footer className="page-foot">
      <span>
        <Link to="/">← BACK TO THE MORNING ROAST</Link>
      </span>
      <span>© MMXXVI ZING HEALTHY TREATS</span>
    </footer>
  )
}
