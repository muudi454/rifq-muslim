import { useI18n } from '../lib/i18n';
import { locationSummary, type UserLocation } from '../lib/location';

/**
 * Shows a location as separate, honest facts: the country with its flag, the
 * country's capital, the user's actual city and region, the real coordinates
 * and the time zone in use.
 *
 * The capital is deliberately its own row — it is a property of the country,
 * never a stand-in for the user's city, so a user in Baidoa sees
 * "City: Baidoa · Capital: Mogadishu".
 */
export default function LocationFacts({ location }: { location: UserLocation | null }) {
  const { t, lang } = useI18n();
  const summary = locationSummary(location, lang);
  if (!summary) return null;

  return (
    <dl className="facts" data-testid="location-facts">
      <div className="fact">
        <dt>{t('loc.country')}</dt>
        <dd>
          <span className="fact-flag" aria-hidden="true">
            {summary.flag}
          </span>{' '}
          <span data-testid="fact-country">{summary.country}</span>
        </dd>
      </div>
      {summary.capital && (
        <div className="fact">
          <dt>{t('loc.capital')}</dt>
          <dd data-testid="fact-capital">{summary.capital}</dd>
        </div>
      )}
      {summary.city && (
        <div className="fact">
          <dt>{t('loc.city')}</dt>
          <dd data-testid="fact-city">{summary.city}</dd>
        </div>
      )}
      {summary.region && (
        <div className="fact">
          <dt>{t('loc.region')}</dt>
          <dd data-testid="fact-region">{summary.region}</dd>
        </div>
      )}
      <div className="fact">
        <dt>{t('loc.coordinates')}</dt>
        <dd data-testid="fact-coords">{summary.coordinates}</dd>
      </div>
      <div className="fact">
        <dt>{t('loc.timezone')}</dt>
        <dd data-testid="fact-tz">{summary.timezone}</dd>
      </div>
      {location?.accuracyM != null && (
        <div className="fact">
          <dt>{t('loc.accuracy')}</dt>
          <dd>±{Math.round(location.accuracyM)} m</dd>
        </div>
      )}
    </dl>
  );
}
