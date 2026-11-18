import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { CONTACT, TEL_LINK, mailtoLink, whatsappLink, api, ApiError } from '../lib/api';

type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactPage() {
  const { lang } = useI18n();
  const { toast } = useStore();
  const L = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ id: string; message: string; emailDelivered: boolean } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const copy = async (label: string, value: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const area = document.createElement('textarea');
        area.value = value;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopied(label);
      toast(L('Copied to clipboard', 'تم النسخ'));
      window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 2000);
    } catch {
      toast(L('Could not copy — please select and copy manually', 'تعذّر النسخ — انسخ يدويًا'));
    }
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (form.name.trim().length < 2) next.name = L('Please enter your name.', 'يرجى إدخال اسمك.');
    if (!EMAIL_RE.test(form.email.trim())) next.email = L('Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.');
    if (form.subject.trim().length < 3) next.subject = L('Add a short subject.', 'أضف موضوعًا قصيرًا.');
    if (form.message.trim().length < 10) next.message = L('Please write at least 10 characters.', 'اكتب 10 أحرف على الأقل.');
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFailure(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSending(true);
    try {
      const result = await api<{ id: string; message: string; emailDelivered: boolean }>('/api/contact', {
        method: 'POST',
        json: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
      });
      setSent({ id: result.id, message: result.message, emailDelivered: result.emailDelivered });
      setForm({ name: '', email: '', subject: '', message: '' });
      toast(L('Message sent', 'تم إرسال الرسالة'));
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = (error as ApiError & { errors?: Record<string, string> }).errors;
        if (detail) {
          setErrors({
            name: detail.name ? L('Please enter your name.', 'يرجى إدخال اسمك.') : undefined,
            email: detail.email ? L('Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.') : undefined,
            subject: detail.subject ? L('Add a short subject.', 'أضف موضوعًا قصيرًا.') : undefined,
            message: detail.message ? L('Please write at least 10 characters.', 'اكتب 10 أحرف على الأقل.') : undefined,
          });
        }
        setFailure(error.message);
      } else {
        setFailure(L('Could not send your message. Please try again.', 'تعذّر إرسال رسالتك. حاول مرة أخرى.'));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{L('Contact us', 'اتصل بنا')}</h1>
          <p className="muted small">
            {L(
              'Questions, corrections or feedback — we are glad to hear from you.',
              'أسئلة أو تصحيحات أو ملاحظات — يسعدنا أن نسمع منك.',
            )}
          </p>
        </div>
      </header>

      <section className="card contact-cards">
        <div className="contact-card">
          <div className="contact-icon" aria-hidden="true">✉</div>
          <div className="row-main">
            <div className="tiny muted">{L('Email', 'البريد الإلكتروني')}</div>
            <a className="contact-value" href={mailtoLink()} data-testid="contact-email-link">
              {CONTACT.email}
            </a>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => copy('email', CONTACT.email)}
            data-testid="copy-email"
          >
            {copied === 'email' ? L('Copied', 'تم النسخ') : L('Copy', 'نسخ')}
          </button>
        </div>

        <div className="contact-card">
          <div className="contact-icon" aria-hidden="true">☎</div>
          <div className="row-main">
            <div className="tiny muted">{L('Phone', 'الهاتف')}</div>
            <a className="contact-value" href={TEL_LINK} dir="ltr" data-testid="contact-phone-link">
              {CONTACT.phone}
            </a>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => copy('phone', CONTACT.phone)}
            data-testid="copy-phone"
          >
            {copied === 'phone' ? L('Copied', 'تم النسخ') : L('Copy', 'نسخ')}
          </button>
        </div>

        <div className="contact-card">
          <div className="contact-icon" aria-hidden="true">✆</div>
          <div className="row-main">
            <div className="tiny muted">WhatsApp</div>
            <a
              className="contact-value"
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="contact-whatsapp-link"
            >
              {L('Chat on WhatsApp', 'تواصل عبر واتساب')}
            </a>
          </div>
          <a
            className="btn btn-primary btn-sm"
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {L('Open', 'فتح')}
          </a>
        </div>
      </section>

      <section className="card">
        <div className="section-title">{L('Send a message', 'أرسل رسالة')}</div>

        {sent ? (
          <div className="alert alert-ok" data-testid="contact-success">
            <strong>{L('Message received', 'تم استلام الرسالة')}</strong>
            <p className="small">{sent.message}</p>
            <p className="tiny muted">
              {L('Reference', 'المرجع')}: <span dir="ltr">{sent.id}</span>
              {' · '}
              {sent.emailDelivered
                ? L('Also emailed to the developer.', 'أُرسلت أيضًا إلى بريد المطوّر.')
                : L('Saved to the RIFQ Muslim inbox.', 'حُفظت في صندوق رسائل رِفْق مسلم.')}
            </p>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSent(null)}>
              {L('Send another message', 'إرسال رسالة أخرى')}
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <label className="field">
              <span>{L('Your name', 'اسمك')}</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
                placeholder={L('Full name', 'الاسم الكامل')}
                data-testid="contact-name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>

            <label className="field">
              <span>{L('Your email', 'بريدك الإلكتروني')}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder="name@example.com"
                dir="ltr"
                data-testid="contact-email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label className="field">
              <span>{L('Subject', 'الموضوع')}</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={set('subject')}
                placeholder={L('What is this about?', 'ما موضوع رسالتك؟')}
                data-testid="contact-subject"
                aria-invalid={Boolean(errors.subject)}
              />
              {errors.subject && <span className="field-error">{errors.subject}</span>}
            </label>

            <label className="field">
              <span>{L('Message', 'الرسالة')}</span>
              <textarea
                name="message"
                rows={6}
                value={form.message}
                onChange={set('message')}
                placeholder={L('Write your message…', 'اكتب رسالتك…')}
                data-testid="contact-message"
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </label>

            {failure && (
              <div className="alert alert-error" data-testid="contact-error" role="alert">
                {failure}
                <p className="tiny">
                  {L('You can also email or phone us directly using the details above.', 'يمكنك أيضًا مراسلتنا أو الاتصال بنا مباشرة عبر البيانات أعلاه.')}
                </p>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={sending} data-testid="contact-submit">
              {sending ? L('Sending…', 'جارٍ الإرسال…') : L('Send message', 'إرسال الرسالة')}
            </button>
            <p className="tiny muted">
              {L(
                'We use your details only to answer your message.',
                'نستخدم بياناتك للرد على رسالتك فقط.',
              )}
            </p>
          </form>
        )}
      </section>

      <p className="credit-line">
        <span className="credit">{CONTACT.developer}</span>
      </p>
    </div>
  );
}
