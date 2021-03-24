/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import { useMemo } from 'react';
import Select from 'react-select';
import { useData } from '../../../context/DataContext';

function ProductCollectionSelect({ update }) {
  const { shopifyCollections } = useData();

  const options = useMemo(
    () =>
      shopifyCollections.data
        ? shopifyCollections.data.map((collection) => {
            return { value: collection.id, label: collection.title };
          })
        : [],
    [shopifyCollections.data]
  );

  const deviceSelectStyles = {
    container: (provided) => ({
      ...provided,
      width: 110,
      height: 27,
      minHeight: 27,
      fontSize: 13,
      marginLeft: 20,
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
      options={[{ value: 'all', label: 'all' }, ...options]}
      placeholder="Product"
      onChange={({ value }) => update(value)}
    />
  );
}

export default ProductCollectionSelect;
