import { useRef } from 'react';
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';

import { Loader, Table, classnames, useElementRect, useRightToLeft } from '@proton/components';
import buffer from '@proton/utils/buffer';

import { FileBrowserProps } from '../FileBrowser';
import { FileBrowserBaseItem } from '../interface';
import { useSelection } from '../state/useSelection';
import ItemCell, { ItemProps } from './ItemCell';
import { calculateCellDimensions } from './utils';

interface ItemCellData<T extends FileBrowserBaseItem> {
    loading?: boolean;
    itemsPerRow: number;
    rowCount: number;
    items: T[];
    getItemProps: (item: T) => Omit<ItemProps<T>, 'style'>;
}

interface GridItemCellProps<T extends FileBrowserBaseItem> extends GridChildComponentProps {
    data: ItemCellData<T>;
}

const GridItemCell = <T extends FileBrowserBaseItem>({
    columnIndex,
    rowIndex,
    style,
    data: { items, rowCount, itemsPerRow, getItemProps, loading },
}: GridItemCellProps<T>) => {
    const currentIndex = columnIndex + rowIndex * itemsPerRow;
    const item = items[currentIndex];
    const emptyOrLoadingCell =
        loading && (currentIndex === 0 || items[currentIndex - 1]) ? (
            <div style={style} className="flex items-center justify-center">
                <Loader />
            </div>
        ) : null;

    return item ? (
        <ItemCell
            {...getItemProps(item)}
            className={classnames([
                columnIndex === 0 && 'pl0-5',
                rowIndex === 0 && 'pt0-5',
                columnIndex === itemsPerRow - 1 && 'pr0-5',
                rowIndex === rowCount - 1 && 'pb0-5',
            ])}
            style={style}
        />
    ) : (
        emptyOrLoadingCell
    );
};

type GridViewProps<T extends FileBrowserBaseItem, T1> = Omit<
    FileBrowserProps<T, T1>,
    'type' | 'onScrollEnd' | 'layout' | 'Cells' | 'headerItems' | 'GridHeaderComponent' | 'GridViewItem'
> & {
    GridHeaderComponent: React.FC<{ scrollAreaRef: React.RefObject<HTMLDivElement> }>;
    GridViewItem: React.FC<{ item: T }>;
    scrollAreaRef: React.RefObject<HTMLDivElement>;
};

function GridView<T extends FileBrowserBaseItem, T1>({
    caption,
    items,
    loading = false,

    GridHeaderComponent,
    GridViewItem,

    onItemContextMenu,
    onItemOpen,
    onItemRender,
    onScroll,
    onViewContextMenu,

    contextMenuAnchorRef,
    scrollAreaRef,

    getDragMoveControls,
}: GridViewProps<T, T1>) {
    const selectionControls = useSelection()!;
    const containerRef = useRef<HTMLDivElement>(null);
    const rect = useElementRect(containerRef, buffer);
    const totalItems = items.length + (loading ? 1 : 0);

    const width = rect?.width ?? 0;

    const { cellHeight, cellWidth } = calculateCellDimensions(width);

    const itemsPerRow = Math.floor(width / cellWidth);
    const rowCount = Math.ceil(totalItems / itemsPerRow);

    const generateItemKey = ({
        columnIndex,
        rowIndex,
        data: { items, itemsPerRow },
    }: {
        columnIndex: number;
        rowIndex: number;
        data: ItemCellData<T>;
    }) => {
        const item = items[columnIndex + rowIndex * itemsPerRow];
        return item?.id ?? `${columnIndex}-${rowIndex}`;
    };

    const itemData: ItemCellData<T> = {
        items,
        itemsPerRow,
        loading,
        rowCount,

        getItemProps: (item: T): Omit<ItemProps<T>, 'style'> => ({
            item,
            dragMoveControls: getDragMoveControls?.(item),

            GridViewItem,

            onItemOpen,
            onItemRender,
            onItemContextMenu,
        }),
    };

    const [isRTL] = useRightToLeft();

    return (
        <div
            className="flex flex-no-min-children flex-item-fluid flex-column no-scroll"
            onClick={selectionControls?.clearSelections}
            onContextMenu={onViewContextMenu}
            ref={containerRef}
            role="presentation"
        >
            <div>
                <Table caption={caption} className="file-browser-table m0">
                    <GridHeaderComponent scrollAreaRef={scrollAreaRef} />
                </Table>
            </div>

            <div className="flex-no-min-children flex-column flex-item-fluid w100 no-scroll" ref={contextMenuAnchorRef}>
                {rect && (
                    <FixedSizeGrid
                        style={{ overflowX: 'hidden', '--padding-bottom-custom': '1.5em' }}
                        direction={isRTL ? 'rtl' : 'ltr'}
                        itemData={itemData}
                        columnWidth={cellWidth}
                        rowHeight={cellHeight}
                        className="pb-custom"
                        height={rect.height}
                        width={rect.width}
                        columnCount={itemsPerRow}
                        rowCount={rowCount}
                        outerRef={scrollAreaRef}
                        onScroll={onScroll}
                        itemKey={generateItemKey}
                    >
                        {GridItemCell}
                    </FixedSizeGrid>
                )}
            </div>
        </div>
    );
}

export default GridView;
