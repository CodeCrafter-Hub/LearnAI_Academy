export function Button({ children, ...props }) {
  return <button {...props} style={{padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #2b3b6b', background: '#172554', color: '#e5edff'}}>{children}</button>;
}
