import React, { ReactNode, useEffect, useState } from 'react';

import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms';
import {
    Icon,
    InnerModal,
    ModalTwo,
    ModalTwoContent,
    ModalTwoFooter,
    ModalTwoHeader,
    PrimaryButton,
    UnderlineButton,
    useActiveBreakpoint,
    useLoading,
    useModals,
} from '@proton/components';

import useActiveShare from '../../hooks/drive/useActiveShare';
import { DecryptedLink, TreeItem, useActions, useFolderTree } from '../../store';
import { ShareType, useShare } from '../../store/_shares';
import CreateFolderModal from '../CreateFolderModal';
import FolderTree from '../FolderTree/FolderTree';
import ModalContentLoader from '../ModalContentLoader';
import { selectMessageForItemList } from '../sections/helpers';
import HasNoFolders from './HasNoFolders';

interface Props {
    shareId: string;
    selectedItems: DecryptedLink[];
    onClose?: () => void;
    open?: boolean;
}

const MoveToFolderModal = ({ shareId, selectedItems, onClose, open }: Props) => {
    const { createModal } = useModals();
    const { moveLinks } = useActions();
    const { activeFolder } = useActiveShare();
    const { getShare } = useShare();
    const { rootFolder, expand, toggleExpand } = useFolderTree(shareId, { rootExpanded: true });

    const [loading, withLoading] = useLoading();
    const [selectedFolder, setSelectedFolder] = useState<string>();
    const { isNarrow } = useActiveBreakpoint();

    const [shareType, setShareType] = useState<ShareType>();

    const moveLinksToFolder = async (parentFolderId: string) => {
        await moveLinks(new AbortController().signal, shareId, selectedItems, parentFolderId);
    };

    const onSelect = (link: DecryptedLink) => {
        if (!loading) {
            setSelectedFolder(link.linkId);
        }
    };

    const handleSubmit = async () => {
        if (selectedFolder) {
            await moveLinksToFolder(selectedFolder);
            onClose?.();
        }
    };

    const handleCreateNewFolderClick = (parentFolderId: string) => {
        createModal(
            <CreateFolderModal
                folder={{ shareId: shareId, linkId: parentFolderId }}
                onCreateDone={async (newFolderId) => {
                    expand(parentFolderId);
                    setSelectedFolder(newFolderId);
                }}
            />
        );
    };

    const itemsToMove = selectedItems.map((item) => item.linkId);
    const itemsToMoveCount = itemsToMove.length;
    const messages = {
        allFiles: c('Notification').ngettext(
            msgid`Move ${itemsToMoveCount} file`,
            `Move ${itemsToMoveCount} files`,
            itemsToMoveCount
        ),
        allFolders: c('Notification').ngettext(
            msgid`Move ${itemsToMoveCount} folder`,
            `Move ${itemsToMoveCount} folders`,
            itemsToMoveCount
        ),
        mixed: c('Notification').ngettext(
            msgid`Move ${itemsToMoveCount} item`,
            `Move ${itemsToMoveCount} items`,
            itemsToMoveCount
        ),
    };

    const moveIsDisabled =
        !selectedFolder ||
        selectedItems.some((item) =>
            [
                item.linkId, // Moving folder to its own folder is not possible.
                item.parentLinkId, // Moving item to the same location is no-op.
            ].includes(selectedFolder)
        );

    let modalContents = {
        title: selectMessageForItemList(
            selectedItems.map((item) => item.isFile),
            messages
        ),
        content: rootFolder && (
            <FolderTree
                treeItems={shareType === ShareType.device ? rootFolder.children : [rootFolder]}
                isLoaded={rootFolder.isLoaded}
                selectedItemId={selectedFolder}
                rowIsDisabled={(item: TreeItem) => itemsToMove.includes(item.link.linkId)}
                onSelect={onSelect}
                toggleExpand={toggleExpand}
            />
        ),
        footer: (
            <ModalTwoFooter>
                <div className="flex flex-justify-space-between w100 flex-nowrap">
                    {isNarrow ? (
                        <Button
                            icon
                            disabled={loading || !selectedFolder}
                            onClick={() => selectedFolder && handleCreateNewFolderClick(selectedFolder)}
                            title={c('Action').t`Create new folder`}
                        >
                            <Icon name="folder-plus" />
                        </Button>
                    ) : (
                        <UnderlineButton
                            disabled={loading || !selectedFolder}
                            onClick={() => selectedFolder && handleCreateNewFolderClick(selectedFolder)}
                        >
                            {c('Action').t`Create new folder`}
                        </UnderlineButton>
                    )}
                    <div>
                        <Button type="reset" disabled={loading} autoFocus>
                            {c('Action').t`Close`}
                        </Button>
                        <PrimaryButton className="ml1" loading={loading} type="submit" disabled={moveIsDisabled}>
                            {c('Action').t`Move`}
                        </PrimaryButton>
                    </div>
                </div>
            </ModalTwoFooter>
        ) as ReactNode,
    };

    if (rootFolder && rootFolder.isLoaded && rootFolder.children.length === 0) {
        modalContents = {
            content: (
                <HasNoFolders
                    onCreate={() => {
                        onClose?.();
                        handleCreateNewFolderClick(rootFolder.link.linkId);
                    }}
                />
            ),
            title: '',
            footer: null,
        };
    }

    useEffect(() => {
        const ac = new AbortController();
        getShare(ac.signal, activeFolder.shareId)
            .then((share) => {
                setShareType(share.type);
            })
            .catch(reportError);
    }, [activeFolder.shareId]);

    return (
        <ModalTwo
            onClose={onClose}
            open={open}
            size="large"
            as="form"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                withLoading(handleSubmit()).catch(console.error);
            }}
            onReset={() => {
                onClose?.();
            }}
        >
            <ModalTwoHeader title={modalContents.title} closeButtonProps={{ disabled: loading }} />
            {!rootFolder || !rootFolder.isLoaded ? (
                <ModalContentLoader>{c('Info').t`Loading`}</ModalContentLoader>
            ) : (
                <>
                    <ModalTwoContent>
                        <InnerModal>{modalContents.content}</InnerModal>
                    </ModalTwoContent>
                    {modalContents.footer}
                </>
            )}
        </ModalTwo>
    );
};

export default MoveToFolderModal;
