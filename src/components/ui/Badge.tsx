interface BadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'green' | 'orange' | 'red' | 'gray' | 'blue' | 'yellow';
}

const colorMap = {
  purple: { bg: '#7C3AED22', text: '#A78BFA', border: '#7C3AED44' },
  green:  { bg: '#16A34A22', text: '#4ADE80', border: '#16A34A44' },
  orange: { bg: '#D9770622', text: '#FB923C', border: '#D9770644' },
  red:    { bg: '#DC262622', text: '#F87171', border: '#DC262644' },
  gray:   { bg: '#6B728022', text: '#9CA3AF', border: '#6B728044' },
  blue:   { bg: '#2563EB22', text: '#60A5FA', border: '#2563EB44' },
  yellow: { bg: '#D9770622', text: '#FCD34D', border: '#D9770644' },
};

export default function Badge({ children, color = 'gray' }: BadgeProps) {
  const c = colorMap[color];
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {children}
    </span>
  );
}