import { c } from 'ttag';

import OfferFooter from '../../components/shared/OfferFooter';
import OfferHeader from '../../components/shared/OfferHeader';
import OfferLoader from '../../components/shared/OfferLoader';
import ProtonLogos from '../../components/shared/ProtonLogos';
import Deals from '../../components/shared/deal/Deals';
import hasOffer from '../../helpers/hasOffer';
import { OfferLayoutProps } from '../../interface';

const Layout = (props: OfferLayoutProps) => {
    return (
        <>
            <ProtonLogos />
            {hasOffer(props) ? (
                <>
                    <OfferHeader {...props}>
                        <h1 className="h2 text-center text-bold">{c('specialoffer: Title')
                            .t`Upgrade and save more with Proton Unlimited`}</h1>
                    </OfferHeader>

                    <Deals {...props} />

                    <OfferFooter {...props}>
                        <p className="text-sm text-center mb1 color-weak">{c('specialoffer: Footer')
                            .t`This subscription will automatically renew every 2 years at the same rate until it is cancelled.`}</p>
                    </OfferFooter>
                </>
            ) : (
                <OfferLoader />
            )}
        </>
    );
};

export default Layout;
