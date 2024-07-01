import { useRef, useState } from 'react';

const useBoolean = (initialValue: any) => {
  const [value, setValue] = useState(initialValue);

  const updateValue = useRef({
    toggle: () => setValue((oldValue: any) => !oldValue),
    on: () => setValue(true),
    off: () => setValue(false),
  });

  return [value, updateValue.current];
};

export default useBoolean;
