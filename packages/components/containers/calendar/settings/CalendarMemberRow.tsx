import { useState } from 'react';

import { c } from 'ttag';

import { Avatar } from '@proton/atoms/Avatar';
import { Button, Icon, Option, SelectTwo, Tooltip } from '@proton/components/components';
import { SelectChangeEvent } from '@proton/components/components/selectTwo/select';
import { useLoading } from '@proton/components/hooks';
import { MEMBER_PERMISSIONS } from '@proton/shared/lib/calendar/permissions';
import { getInitials } from '@proton/shared/lib/helpers/string';
import { MEMBER_INVITATION_STATUS } from '@proton/shared/lib/interfaces/calendar';

import { TableCell, TableRow } from '../../../components';

import './CalendarMemberGrid.scss';

interface CalendarMemberRowProps {
    email: string;
    name: string;
    deleteLabel: string;
    permissions: number;
    status?: MEMBER_INVITATION_STATUS;
    displayPermissions: boolean;
    displayStatus: boolean;
    onPermissionsUpdate: (newPermissions: number) => Promise<void>;
    onDelete: () => Promise<void>;
}

const permissionLabelMap = {
    // [CalendarMemberPermissions.EDIT]: c('Calendar share permission label').t`Edit`,
    [MEMBER_PERMISSIONS.FULL_VIEW]: c('Calendar share permission label').t`See all event details`,
    // [CalendarMemberPermissions.LIMITED]: c('Calendar share permission label').t`See only free/busy`,
};

export const MemberStatus = ({ children }: { children: string }) => (
    <span
        title={children}
        className="calendar-member-status inline-block text-ellipsis text-sm text-semibold color-weak bg-strong text-uppercase rounded text-no-wrap"
    >
        {children}
    </span>
);

const CalendarMemberRow = ({
    email,
    name,
    deleteLabel,
    permissions,
    status,
    displayPermissions,
    displayStatus,
    onPermissionsUpdate,
    onDelete,
}: CalendarMemberRowProps) => {
    const [isLoadingDelete, withLoadingDelete] = useLoading();
    const [isLoadingPermissionsUpdate, withLoadingPermissionsUpdate] = useLoading();

    const [perms, setPerms] = useState(permissions);

    const handleDelete = () => withLoadingDelete(onDelete());
    const handleChangePermissions = async ({ value: newPermissions }: SelectChangeEvent<number>) => {
        await withLoadingPermissionsUpdate(onPermissionsUpdate(newPermissions));
        setPerms(newPermissions);
    };

    const isStatusRejected = status === MEMBER_INVITATION_STATUS.REJECTED;

    const getStatusLabel = () => {
        if (status === MEMBER_INVITATION_STATUS.PENDING) {
            return <MemberStatus>{c('Calendar invite status label').t`Invite sent`}</MemberStatus>;
        }

        if (isStatusRejected) {
            return <MemberStatus>{c('Calendar invite status label').t`Declined`}</MemberStatus>;
        }

        return null;
    };

    return (
        <TableRow>
            <TableCell className="on-mobile-pl0">
                <div className="flex flex-nowrap flex-align-items-baseline flex-gap-0-5 on-mobile-w40">
                    <Avatar className="avatar--weak flex-item-noshrink no-mobile no-tablet">{getInitials(name)}</Avatar>

                    <div>
                        <div className="text-ellipsis" title={name}>
                            {name}
                        </div>
                        {email !== name && (
                            <div className="text-ellipsis text-sm m0 color-weak" title={email}>
                                {email}
                            </div>
                        )}
                        {displayStatus && <div className="no-desktop">{getStatusLabel()}</div>}

                        {displayPermissions && !isStatusRejected && (
                            <div className="no-desktop no-tablet on-mobile-inline-flex">
                                <SelectTwo
                                    loading={isLoadingPermissionsUpdate}
                                    value={perms}
                                    onChange={handleChangePermissions}
                                >
                                    {Object.entries(permissionLabelMap).map(([value, label]) => (
                                        <Option key={value} value={+value} title={label} />
                                    ))}
                                </SelectTwo>
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            {displayPermissions && (
                <TableCell className="no-mobile">
                    {!isStatusRejected && (
                        <SelectTwo
                            loading={isLoadingPermissionsUpdate}
                            value={perms}
                            onChange={handleChangePermissions}
                        >
                            {Object.entries(permissionLabelMap).map(([value, label]) => (
                                <Option key={value} value={+value} title={label} />
                            ))}
                        </SelectTwo>
                    )}
                </TableCell>
            )}
            {displayStatus && <TableCell className="no-mobile no-tablet">{getStatusLabel()}</TableCell>}
            <TableCell className="w5e">
                <Tooltip title={deleteLabel}>
                    <Button icon shape="ghost" loading={isLoadingDelete} onClick={handleDelete} className="mlauto">
                        <Icon name="trash" alt={deleteLabel} />
                    </Button>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};

export default CalendarMemberRow;
