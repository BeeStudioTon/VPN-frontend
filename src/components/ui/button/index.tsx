/* eslint-disable import/no-unresolved */
import React, { FC, ReactNode, ButtonHTMLAttributes } from 'react'

import { Button as Btn } from '@delab-team/de-ui'

import s from './button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: (...args: any) => void;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
    loading?: boolean;
}

export const Button: FC<ButtonProps> = ({ onClick, loading, children, disabled, className, ...rest }) => (
    <Btn className={`${s.button} ${className}`} disabled={disabled} loading={loading} onClick={onClick} {...rest}>
        {children}
    </Btn>
)
