import { format, fromUnixTime } from 'date-fns';
import { c } from 'ttag';

import { APPS, MAIL_APP_NAME, PLANS } from '@proton/shared/lib/constants';
import { isTrial, isTrialExpired, willTrialExpire } from '@proton/shared/lib/helpers/subscription';
import { dateLocale } from '@proton/shared/lib/i18n';

import { SettingsLink } from '../../components';
import { useConfig, useSubscription } from '../../hooks';
import TopBanner from './TopBanner';

const ReferralTopBanner = () => {
    const [subscription, loadingSubscription] = useSubscription();
    const { APP_NAME } = useConfig();
    const isVpn = APP_NAME === APPS.PROTONVPN_SETTINGS;

    if (loadingSubscription) {
        return null;
    }

    if (isVpn) {
        return null;
    }

    const { PeriodEnd = 0 } = subscription;
    const trial = isTrial(subscription);
    const willExpire = willTrialExpire(subscription);
    const isExpired = isTrialExpired(subscription);
    const textAction = c('Button').t`Continue using ${MAIL_APP_NAME}.`;
    const action = (
        <SettingsLink key="continue" className="color-inherit" path={`/dashboard?plan=${PLANS.MAIL}`}>
            {textAction}
        </SettingsLink>
    );
    const textDate = format(fromUnixTime(PeriodEnd), 'MMMM d yyyy', { locale: dateLocale });

    if (!trial) {
        return null;
    }

    // 1 week before the trial ends
    if (willExpire) {
        const message = c('Warning').jt`Your free trial ends on ${textDate}. ${action}`;
        return <TopBanner className="bg-warning">{message}</TopBanner>;
    }

    // Trial has ended
    if (isExpired) {
        const message = c('Message')
            .jt`Your free trial has ended. Access to your account will soon be disabled. ${action}`;
        return <TopBanner className="bg-danger">{message}</TopBanner>;
    }

    // In trial
    return null;
};

export default ReferralTopBanner;
