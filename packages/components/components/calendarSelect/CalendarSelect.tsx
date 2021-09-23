import { ComponentPropsWithoutRef } from 'react';
import { CalendarSelectOptions } from '@proton/shared/lib/interfaces/calendar';
import { Option } from '../option';
import { SelectTwo } from '../selectTwo';
import { SelectChangeEvent } from '../selectTwo/select';

import CalendarSelectIcon from './CalendarSelectIcon';

interface Props
    extends Omit<ComponentPropsWithoutRef<'button'>, 'value' | 'onClick' | 'onChange' | 'onKeyDown' | 'aria-label'> {
    calendarID: string;
    options: CalendarSelectOptions[];
    onChange: (e: SelectChangeEvent<string>) => void;
}

const CalendarSelect = ({ calendarID, options, onChange, ...rest }: Props) => {
    return (
        <SelectTwo value={calendarID} onChange={onChange} {...rest}>
            {options.map(({ id, name, color }) => (
                <Option value={id} title={name} key={id}>
                    <div className="flex flex-nowrap flex-align-items-center">
                        <CalendarSelectIcon color={color} className="flex-item-noshrink mr0-75" />
                        <div className="text-ellipsis">{name}</div>
                    </div>
                </Option>
            ))}
        </SelectTwo>
    );
};

export default CalendarSelect;
