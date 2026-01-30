import { useState, type ReactNode } from "react"
import { buttonStyles } from "../../core/helpers/styles"

interface ToggleButtonProps {
  defaultOn?: boolean
  onToggleButton: ReactNode,
  offToggleButton: ReactNode,
  onToggleRequest: (nextState: boolean) => Promise<boolean> | boolean
}

export default function ToggleButton({
  defaultOn = false,
  onToggleRequest,
  onToggleButton,
  offToggleButton
}: ToggleButtonProps) {
  const [isOn, setIsOn] = useState(defaultOn)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return

    const next = !isOn
    setLoading(true)

    try {
      const allowed = await onToggleRequest(next)

      if (allowed) {
        setIsOn(next)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`
        ${buttonStyles.base}
        ${isOn ? buttonStyles.green : buttonStyles.orange}
      `}
    >
      {loading ? "Verificando..." : isOn ? onToggleButton : offToggleButton}
    </button>
  )
}
