import { useMemo, useState } from 'react';
import { devices } from '../constants';

function useDevice() {
  const [deviceNum, setDeviceNum] = useState(0);
  const device = useMemo(() => devices[deviceNum], [deviceNum]);

  return { device, setDevice: setDeviceNum };
}

export default useDevice;
