import { ADDRESS_STATUS, ADDRESS_TYPE, MEMBER_PRIVATE, RECEIVE_ADDRESS } from '@proton/shared/lib/constants';
import { Address, CachedOrganizationKey, Member, UserModel } from '@proton/shared/lib/interfaces';

const { TYPE_ORIGINAL, TYPE_CUSTOM_DOMAIN, TYPE_PREMIUM, TYPE_EXTERNAL } = ADDRESS_TYPE;

export const getStatus = (address: Address, i: number) => {
    const { Status, Receive, DomainID, HasKeys } = address;

    const isActive = Status === ADDRESS_STATUS.STATUS_ENABLED && Receive === RECEIVE_ADDRESS.RECEIVE_YES;
    const isDisabled = Status === ADDRESS_STATUS.STATUS_DISABLED;
    const isOrphan = DomainID === null;
    const isMissingKeys = !HasKeys;

    return {
        isDefault: i === 0 && !isDisabled && isActive,
        isActive,
        isDisabled,
        isOrphan,
        isMissingKeys,
    };
};

export const getPermissions = ({
    member,
    address: { ID, Status, HasKeys, Type, Priority },
    addresses,
    user,
    organizationKey,
    addressIndex,
}: {
    addressIndex: number;
    member?: Member;
    address: Address;
    addresses: Address[];
    user: UserModel;
    organizationKey?: CachedOrganizationKey;
}) => {
    const { isAdmin, canPay, isSubUser } = user;

    const isSpecialAddress = Type === TYPE_ORIGINAL || Type === TYPE_PREMIUM;

    const isSelf = !member || !!member.Self;
    const isMemberReadable = member?.Private === MEMBER_PRIVATE.READABLE;
    const isDefault = addressIndex === 0;
    const isEnabled = Status === ADDRESS_STATUS.STATUS_ENABLED;

    const canMakeDefault = !isDefault && isEnabled;

    /*
     * Keys can be generated if the organisation key is decrypted, and you are an admin,
     * and the member is readable, you're not an admin signed in to a readable member.
     */
    const canGenerateMember = organizationKey?.privateKey && isAdmin && isMemberReadable && !isSubUser;
    /*
     * Even though the user in question regarding the permissions here might be
     * the currently logged in user itself (isSelf), it's possible that they don't
     * have the necessary permission to generate their own missing keys. This is
     * the case if the currently logged in user is a member of an org of which they
     * are not an admin of.
     */
    const canGenerateSelf = isSelf && user.Private === MEMBER_PRIVATE.UNREADABLE;
    const canGenerate = !HasKeys && (canGenerateMember || canGenerateSelf);

    let canDisable = isEnabled && isAdmin && !isSpecialAddress;

    // TODO: This is a heuristic that finds out if it's a managed user pending the new Type field (which will
    // be added to the member response) by looking if it has a PM address or external address.
    const isManagedUser = !addresses.some(
        (address) => address.Type === TYPE_ORIGINAL || address.Type === TYPE_EXTERNAL
    );
    if (isManagedUser) {
        const hasOtherEnabledAddress = addresses.some(
            (otherAddress) => otherAddress.ID !== ID && otherAddress.Status === ADDRESS_STATUS.STATUS_ENABLED
        );
        // Accounts for: 'Cannot disable your only enabled address. Please add another address first'
        if (!hasOtherEnabledAddress && isSelf) {
            canDisable = false;
        }
        // Accounts for: 'Cannot disable your default address. Please make another address default first'
        if (hasOtherEnabledAddress && Priority === 1) {
            canDisable = false;
        }
    }

    return {
        canMakeDefault,
        canGenerate,
        canDisable,
        canEnable: Status === ADDRESS_STATUS.STATUS_DISABLED && isAdmin && !isSpecialAddress,
        // Takes into account disabling permissions since it does that automatically. canPay to simulate the "payments" scope for delete route.
        canDelete: ((isEnabled && canDisable) || !isEnabled) && Type === TYPE_CUSTOM_DOMAIN && canPay,
        canEdit: isSelf,
    };
};

// Moves disabled addresses to the back of the list, and sorts by order.
const addressSort = (a: Address, b: Address) => {
    if (a.Status === ADDRESS_STATUS.STATUS_DISABLED) {
        return 1;
    }
    if (b.Status === ADDRESS_STATUS.STATUS_DISABLED) {
        return -1;
    }
    return a.Order - b.Order;
};

export const formatAddresses = (addresses?: Address[]) => {
    if (Array.isArray(addresses)) {
        return addresses.filter(({ Type }) => Type !== ADDRESS_TYPE.TYPE_EXTERNAL).sort(addressSort);
    }
    return [];
};

export type AddressPermissions = ReturnType<typeof getPermissions>;
export type AddressStatuses = ReturnType<typeof getStatus>;
