import type { Signal } from '../../utils/scanner'

interface Props {
  signal: Signal
}

export function SignalBadge({ signal }: Props) {
  const cls =
    signal.ok === true
      ? 'sig-ok'
      : signal.ok === 'warn'
        ? 'sig-warn'
        : 'sig-fail'

  return (
    <span
      className={`${cls} text-[9px] px-2 py-0.5 rounded-full`}
    >
      {signal.label}
    </span>
  )
}
