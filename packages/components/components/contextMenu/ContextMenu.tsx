import { ReactNode, RefObject, useEffect, useState } from 'react';

import { generateUID } from '../../helpers';
import { Dropdown } from '../dropdown';
import { PopperPosition, cornerPopperPlacements } from '../popper';

export interface ContextMenuProps {
    anchorRef: RefObject<HTMLElement>;
    isOpen: boolean;
    children: ReactNode;
    position?: PopperPosition;
    close: () => void;
    autoClose?: boolean;
    noMaxHeight?: boolean;
}

const ContextMenu = ({
    anchorRef,
    children,
    isOpen,
    position,
    close,
    autoClose = true,
    noMaxHeight = false,
}: ContextMenuProps) => {
    const [uid] = useState(generateUID('context-menu'));

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleContextMenu = () => {
            if (autoClose) {
                close();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu, { capture: true });

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
        };
    }, [isOpen, autoClose, close]);

    return (
        <Dropdown
            id={uid}
            isOpen={isOpen}
            anchorRef={anchorRef}
            anchorPosition={position}
            availablePlacements={cornerPopperPlacements}
            noCaret
            autoCloseOutsideAnchor={false}
            originalPlacement="bottom-start"
            offset={1}
            onClose={close}
            onContextMenu={(e) => e.stopPropagation()}
            noMaxHeight={noMaxHeight}
        >
            {children}
        </Dropdown>
    );
};

export default ContextMenu;
