type StatusNoticeProps = {
  title: string;
  message: string;
  tone?: 'info' | 'warning' | 'empty';
};

export function StatusNotice({ title, message, tone = 'info' }: StatusNoticeProps) {
  return (
    <section className={`status-notice status-notice--${tone}`} role="status" aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
