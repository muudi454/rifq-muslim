import { useI18n } from '../lib/i18n';
import { CONTACT, mailtoLink } from '../lib/api';
import { Link } from '../lib/router';

const EFFECTIVE = '18 November 2026';

export default function PrivacyPage() {
  const { lang } = useI18n();
  const L = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{L('Privacy policy', 'سياسة الخصوصية')}</h1>
          <p className="muted small">
            {L('RIFQ Muslim · effective', 'رِفْق مسلم · سارية من')} {EFFECTIVE}
          </p>
        </div>
      </header>

      <section className="card prose">
        <h2>{L('What we store', 'ما نحفظه')}</h2>
        <p>
          {L(
            'RIFQ Muslim keeps your bookmarks, Tasbih counts, language, theme, calculation method and location on your own device. If you create an account, the same preferences and bookmarks are also saved to your account so they follow you between devices.',
            'يحفظ رِفْق مسلم مفضّلتك وعدّاد التسبيح واللغة والمظهر وطريقة الحساب والموقع على جهازك. وإذا أنشأت حسابًا، تُحفظ التفضيلات والمفضّلة نفسها في حسابك لتنتقل معك بين الأجهزة.',
          )}
        </p>

        <h2>{L('Location', 'الموقع')}</h2>
        <p>
          {L(
            'Location is used only to calculate prayer times and Qibla direction. Your coordinates are saved on your device when you choose a place, and are never sold or used for advertising.',
            'يُستخدم الموقع فقط لحساب مواقيت الصلاة واتجاه القبلة. تُحفظ إحداثياتك على جهازك عند اختيار المكان، ولا تُباع ولا تُستخدم للإعلانات.',
          )}
        </p>

        <h2>{L('Notifications', 'الإشعارات')}</h2>
        <p>
          {L(
            'Athan notifications are calculated on your device. If you enable background push, your browser creates a subscription that the app server uses to deliver prayer reminders and occasional announcements from the app team.',
            'تُحسب إشعارات الأذان على جهازك. وإذا شغّلت إشعارات الخلفية، ينشئ متصفحك اشتراكًا يستخدمه خادم التطبيق لإرسال تذكيرات الصلاة وإعلانات من فريق التطبيق.',
          )}
        </p>

        <h2>{L('Contact messages', 'رسائل التواصل')}</h2>
        <p>
          {L(
            'When you use the contact form we store your name, email, subject and message so we can reply. Messages are visible only to authorised administrators. We never publish your details.',
            'عند استخدام نموذج التواصل نحفظ اسمك وبريدك وموضوع رسالتك ونصها للرد عليك. الرسائل مرئية للمشرفين المصرّح لهم فقط، ولا ننشر بياناتك.',
          )}
        </p>

        <h2>{L('No ads, no tracking', 'لا إعلانات ولا تتبّع')}</h2>
        <p>
          {L(
            'RIFQ Muslim is free, contains no advertising, no paid subscriptions and no third-party advertising trackers.',
            'رِفْق مسلم مجاني، ولا يحتوي على إعلانات ولا اشتراكات مدفوعة ولا أدوات تتبّع إعلانية.',
          )}
        </p>

        <h2>{L('Your choices', 'خياراتك')}</h2>
        <p>
          {L(
            'You can clear your saved data at any time from Settings, and you can revoke location or notification permission in your browser or phone settings. To delete an account or a contact message, write to us and we will remove it.',
            'يمكنك مسح بياناتك المحفوظة في أي وقت من الإعدادات، ويمكنك سحب إذن الموقع أو الإشعارات من إعدادات المتصفح أو الهاتف. لحذف حساب أو رسالة تواصل، راسلنا وسنحذفها.',
          )}
        </p>

        <h2>{L('Contact', 'التواصل')}</h2>
        <p>
          <a href={mailtoLink('Privacy request — RIFQ Muslim')}>{CONTACT.email}</a>
          {' · '}
          <a href={`tel:${CONTACT.phoneDial}`} dir="ltr">
            {CONTACT.phone}
          </a>
        </p>
        <p className="tiny muted">{CONTACT.developer}</p>
        <p className="tiny">
          <Link to="/contact">{L('Contact form', 'نموذج التواصل')}</Link>
        </p>
      </section>
    </div>
  );
}
