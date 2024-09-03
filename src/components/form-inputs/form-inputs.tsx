import InputMask from 'react-input-mask';
import {cn} from "@/lib/utils";

export const EmailInput = (props) => {
    return (
        <input
            type="email"
            placeholder="Digite o email..."
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
            {...props}
        />
    );
};

export const CPFInput = (props) => {
    return (
        <InputMask
            mask="999.999.999-99"
            placeholder="000.000.000-00"
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
            {...props}
        />
    );
};

export const RGInput = (props) => {
    return (
        <InputMask
            mask="99.999.999"
            placeholder="00.000.000"
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
            {...props}
        />
    );
};

export const PhoneInput = (props) => {
    return (
        <InputMask
            mask="(99) 99999-9999"
            placeholder="(00) 00000-0000"
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
            {...props}
        />
    );
};