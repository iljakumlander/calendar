import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';
import { Dialog as DialogProps } from '../interfaces';
import { Values } from '../types';
import Field from '../form/field';

const Dialog: React.FC<DialogProps> = ({
    title,
    message,
    inputs,
    actions,
    prefer,
    autofocus,
    className,
    onDisplay,
}) => {
    const memo = useMemo(() => inputs.reduce((names, current) => {
        names[current.name] = current.value;
        
        return names;
    }, {} as Values), [inputs]);
    const [values, setValues] = useState<Values>(memo);
    const dialogRef = useRef<HTMLDivElement>(null);
    const dismiss = actions && actions.dismiss;
    const resolve = actions && actions.resolve;
    const reject = actions && actions.reject;
    const diverge = actions && actions.diverge;
    const defaults = prefer && actions && actions[prefer];
    const cancellable = dismiss && typeof dismiss.callback === 'function';

    const cancel = useCallback(() => dismiss && dismiss.callback(values), [dismiss, values]);
    const confirm = useCallback(() => resolve && resolve.callback(values), [resolve, values]);
    const deny = useCallback(() => reject && reject.callback(values), [reject, values]);
    const redirect = useCallback(() => diverge && diverge.callback(values), [diverge, values]);

    const change = (event: React.ChangeEvent<HTMLInputElement>) => setValues({
        ...values,
        [event.target.name]: event.target.value,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!defaults) {
            return;
        }

        defaults?.callback(values);
    }

    const press = (event: React.KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case 'Escape':
                if (!cancellable) {
                    break;
                }

                event.preventDefault();

                cancel();

                break;
            
            case 'Enter':
                if (!defaults) {
                    return;
                }

                defaults?.callback(values);

                break;

            case 'Backspace':
            case 'Delete':
                if (event.target instanceof HTMLInputElement) {
                    break;
                }

                if (diverge) {
                    event.preventDefault();

                    redirect();
                }

                else if (cancellable) {
                    event.preventDefault();

                    cancel();
                }

                break;
        }
    };

    useEffect(() => {
        const click = (event: MouseEvent): void => {
            cancellable &&
            dialogRef.current &&
            dialogRef.current.contains(event.target as Node) &&
            (event.target as HTMLElement)?.className === dialogRef.current.className &&
            [
                event.preventDefault(),
                cancel()
            ];
        };

        cancellable && document.addEventListener('click', click);

        return () => {
            document.removeEventListener('click', click);
        };
    }, [dialogRef, cancellable, cancel, focus]);

    return (
        <div ref={dialogRef} className={['dialog', ...[className ? className : []]].join(' ')} onKeyDown={press} tabIndex={0}>
            <div className="contents">
                {cancellable && <button className="exit" onClick={cancel} type="button">Exit {title && title} dialog box</button>}
                <FocusLock>
                    {title && <h2>{title}</h2>}
                    {message && <p>{message}</p>}
                    {inputs && inputs.length > 0 && (
                        <form onSubmit={submit}>
                            {inputs.map((input, index) => (
                                <fieldset key={index}>
                                    {input.title && <legend>{input.title}</legend>}
                                    <Field
                                        type={input.type}
                                        name={input.name}
                                        value={values[input.name]}
                                        required={input.required}
                                        autofocus={autofocus && index === 0}
                                        options={input.options}
                                        checked={input.checked}
                                        onChange={change}
                                    />
                                </fieldset>
                            ))}
                        </form>
                    )}
                    {(dismiss || resolve || reject || diverge) && (
                        <div className={['bar', prefer ? `-${prefer}` : ''].join(' ').trim()}>
                            {dismiss && <button className={dismiss.type} onClick={cancel}  {...(prefer === dismiss.type ? { "data-autofocus": true } : { type: 'button'})} >{dismiss.caption}</button>}
                            {resolve && <button className={resolve.type} onClick={confirm} {...(prefer === resolve.type ? { "data-autofocus": true } : { type: 'button'})} >{resolve.caption}</button>}
                            {reject && <button className={reject.type} onClick={deny} {...(prefer === reject.type ? { "data-autofocus": true } : { type: 'button'})}>{reject.caption}</button>}
                            {diverge && <button className={diverge.type} onClick={redirect} {...(prefer === diverge.type ? { "data-autofocus": true } : { type: 'button'})}>{diverge.caption}</button>}
                        </div>
                    )}
                </FocusLock>
            </div>
        </div>
    );
};

export default Dialog;
