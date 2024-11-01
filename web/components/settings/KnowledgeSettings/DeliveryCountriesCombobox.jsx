import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Combobox,
  Listbox,
  Tag,
  Text,
  Icon,
  EmptySearchResult,
  AutoSelection,
  BlockStack,
  InlineStack,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

export function DeliveryCountriesCombobox({ deliveryCountries, setDeliveryCountries }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await response.json();

        const sortedCountries = data
          .map((country) => country.name.common)
          .sort((a, b) => a.localeCompare(b));
        
        setAllCountries(sortedCountries);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    }
    fetchCountries();
  }, []);

  const handleInputChange = useCallback((value) => setInputValue(value), []);
  const handleActiveOptionChange = useCallback(
    (activeOption) => {
      if (activeOption && !deliveryCountries.includes(activeOption)) {
        setSuggestion(activeOption);
      } else {
        setSuggestion('');
      }
    },
    [deliveryCountries]
  );

  const updateSelection = useCallback(
    (selected) => {
      if (!allCountries.includes(selected)) {
        return;
      }
      const newCountries = new Set(deliveryCountries);
      if (newCountries.has(selected)) {
        newCountries.delete(selected);
      } else {
        newCountries.add(selected);
      }
      setDeliveryCountries([...newCountries]);
      setInputValue('');
      setSuggestion('');
    },
    [deliveryCountries, setDeliveryCountries, allCountries]
  );

  const removeCountry = useCallback(
    (country) => () => updateSelection(country),
    [updateSelection]
  );

  const filteredCountries = useMemo(() => {
    if (!inputValue) return allCountries;
    const filterRegex = new RegExp(inputValue, 'i');
    return allCountries.filter((country) => country.match(filterRegex));
  }, [allCountries, inputValue]);

  const optionsMarkup = filteredCountries.map((option) => (
    <Listbox.Option
      key={option}
      value={option}
      selected={deliveryCountries.includes(option)}
      accessibilityLabel={option}
    >
      <Listbox.TextOption selected={deliveryCountries.includes(option)}>
        <Text as="span">
          {option.split(new RegExp(`(${inputValue})`, 'i')).map((part, index) => (
            <Text
              key={index}
              as="span"
              fontWeight={
                part.toLowerCase() === inputValue.toLowerCase() ? 'bold' : undefined
              }
            >
              {part}
            </Text>
          ))}
        </Text>
      </Listbox.TextOption>
    </Listbox.Option>
  ));

  const noResults = inputValue && !allCountries.includes(inputValue);

  const emptyStateMarkup = optionsMarkup.length === 0 ? (
    <EmptySearchResult
      title=""
      description={`No countries found matching "${inputValue}"`}
    />
  ) : null;

  const listboxMarkup =
    optionsMarkup.length > 0 || emptyStateMarkup ? (
      <Listbox
        autoSelection={AutoSelection.None}
        onSelect={updateSelection}
        onActiveOptionChange={handleActiveOptionChange}
      >
        {optionsMarkup}
      </Listbox>
    ) : null;

  const inlineContentMarkup = deliveryCountries.length > 0 ? (
    console.log(deliveryCountries),
    <InlineStack gap={100}>
      {deliveryCountries.map((country) => (
        <Tag key={country} onRemove={removeCountry(country)}>
          {country}
        </Tag>
      ))}
    </InlineStack>
  ) : null;

  return (
    <BlockStack gap={200}>
      <BlockStack>
        <Text variant="headingMd">Delivery Countries</Text>
        <Text variant="bodyMd">Let customers know in which countries you deliver.</Text>
      </BlockStack>
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            prefix={<Icon source={SearchIcon} />}
            onChange={handleInputChange}
            label="Add Delivery Country"
            labelHidden
            value={inputValue}
            suggestion={suggestion}
            placeholder="Search countries"
            verticalContent={inlineContentMarkup}
            autoComplete="on"
          />
        }
      >
        {listboxMarkup}
      </Combobox>
    </BlockStack>
  );
}
