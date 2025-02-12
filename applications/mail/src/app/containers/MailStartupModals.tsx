import { useEffect, useRef } from 'react';

import {
    FeatureCode,
    MigrationModal,
    RebrandingFeedbackModal,
    ReferralModal,
    getShouldOpenMigrationModal,
    getShouldOpenReferralModal,
    useFeature,
    useModalState,
    useRebrandingFeedback,
    useSubscription,
} from '@proton/components';
import { APPS } from '@proton/shared/lib/constants';

import MailOnboardingModal from '../components/onboarding/MailOnboardingModal';

interface Props {
    onboardingOpen: boolean;
    onOnboardingDone: () => void;
}

const MailStartupModals = ({ onboardingOpen, onOnboardingDone }: Props) => {
    // Migration modal
    const [migrationModal, setMigrationModal, renderMigrationModal] = useModalState();
    const migrationModalLastShownFeature = useFeature<string>(FeatureCode.MigrationModalLastShown);
    const shouldOpenMigrationModal = getShouldOpenMigrationModal(migrationModalLastShownFeature);

    // Onboarding modal
    const [onboardingModal, setOnboardingModal, renderOnboardingModal] = useModalState();

    // Referral modal
    const [subscription] = useSubscription();
    const seenReferralModal = useFeature<boolean>(FeatureCode.SeenReferralModal);
    const [referralModal, setReferralModal, renderReferralModal] = useModalState();
    const shouldOpenReferralModal = getShouldOpenReferralModal({ subscription, feature: seenReferralModal.feature });

    const [rebrandingFeedbackModal, setRebrandingFeedbackModal, renderRebrandingFeedbackModal] = useModalState();
    const handleRebrandingFeedbackModalDisplay = useRebrandingFeedback();

    const onceRef = useRef(false);
    useEffect(() => {
        if (onceRef.current) {
            return;
        }

        const openModal = (setModalOpen: (newValue: boolean) => void) => {
            onceRef.current = true;
            setModalOpen(true);
        };

        if (shouldOpenMigrationModal) {
            openModal(setMigrationModal);
        } else if (onboardingOpen) {
            openModal(setOnboardingModal);
        } else if (shouldOpenReferralModal.open) {
            openModal(setReferralModal);
        } else if (handleRebrandingFeedbackModalDisplay) {
            openModal(setRebrandingFeedbackModal);
        }
    }, [shouldOpenMigrationModal, shouldOpenReferralModal.open, handleRebrandingFeedbackModalDisplay]);

    return (
        <>
            {renderMigrationModal && <MigrationModal app={APPS.PROTONMAIL} {...migrationModal} />}
            {renderOnboardingModal && (
                <MailOnboardingModal
                    onDone={() => {
                        onOnboardingDone();
                        onboardingModal.onClose();
                    }}
                    onExit={onboardingModal.onExit}
                    open={onboardingModal.open}
                />
            )}
            {renderReferralModal && <ReferralModal endDate={shouldOpenReferralModal.endDate} {...referralModal} />}
            {renderRebrandingFeedbackModal && (
                <RebrandingFeedbackModal onMount={handleRebrandingFeedbackModalDisplay} {...rebrandingFeedbackModal} />
            )}
        </>
    );
};

export default MailStartupModals;
