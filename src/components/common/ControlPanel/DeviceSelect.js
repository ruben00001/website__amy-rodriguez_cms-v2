/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import React, { useMemo } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDesktop,
  faLaptop,
  faMobileAlt,
  faTabletAlt,
} from '@fortawesome/free-solid-svg-icons';

import { devices } from '../../../constants';
import { useContentPage } from '../../../context/ContentPageContext';

function DeviceSelect() {
  const { page, setDevice } = useContentPage();

  const devicesProcessed = useMemo(
    () =>
      devices && page
        ? devices.sort((a, b) =>
            page === 'press' ? b.width - a.width : b.aspectRatio - a.aspectRatio
          )
        : 'null',
    [page]
  );

  const devices_landscape = useMemo(
    () =>
      devicesProcessed
        ? devicesProcessed.filter((device) => device.aspectRatio > 1)
        : 'null',
    [devicesProcessed]
  );

  const devices_portrait = useMemo(
    () =>
      devicesProcessed
        ? devicesProcessed.filter((device) => device.aspectRatio <= 1)
        : 'null',
    [devicesProcessed]
  );

  const DeviceOptions = (devices) =>
    devices.map((device) => {
      return {
        value: device,
        label: (
          <React.Fragment>
            <FontAwesomeIcon
              css={{ marginRight: 8 }}
              icon={
                device.type === 'desktop'
                  ? faDesktop
                  : device.type === 'laptop'
                  ? faLaptop
                  : device.type === 'tablet'
                  ? faTabletAlt
                  : faMobileAlt
              }
            />
            <span>
              {device.name} :{' '}
              {page === 'press'
                ? `${device.width}px width`
                : `${device.aspectRatio} aspect ratio`}
            </span>
          </React.Fragment>
        ),
      };
    });

  const deviceSelectStyles = {
    container: (provided) => ({
      ...provided,
      width: 110,
      height: 27,
      minHeight: 27,
      fontSize: 13,
      marginLeft: 40,
    }),
    control: (provided, state) => ({
      ...provided,
      minHeight: 27,
      height: 27,
      boxShadow: state.menuIsOpen ? '0 0 0 1px rgb(68, 194, 255)' : 'none',
      borderRadius: 2,
    }),
    valueContainer: (provided) => ({
      ...provided,
      transform: 'translateY(-4px)',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      transform: 'translateY(-5px)',
    }),
    menu: (provided) => ({
      ...provided,
      width: 250,
    }),
  };

  return (
    <Select
      styles={deviceSelectStyles}
      // defaultValue={DeviceOptions(devices_landscape)[0]}
      options={[
        { label: 'Landscape', options: DeviceOptions(devices_landscape) },
        { label: 'Portrait', options: DeviceOptions(devices_portrait) },
      ]}
      placeholder="Device"
      onChange={({ value }) => setDevice(value)}
    />
  );
}

export default DeviceSelect;
