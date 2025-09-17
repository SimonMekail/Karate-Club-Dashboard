import { useState } from "react";

export const search = (
  keyWord,
  elements,
  searchFields = ["name"],
  selectedField = null
) => {
  if (!keyWord) return elements;

  const lowerCaseKeyword = keyWord.toLowerCase();

  return elements.filter((element) => {
    if (selectedField) {
      const fieldValue = selectedField
        .split(".")
        .reduce(
          (obj, key) => (obj && obj[key] !== undefined ? obj[key] : null),
          element
        );

      return String(fieldValue || "")
        .toLowerCase()
        .includes(lowerCaseKeyword);
    }

    return searchFields.some((field) => {
      const fieldValue = field
        .split(".")
        .reduce(
          (obj, key) => (obj && obj[key] !== undefined ? obj[key] : null),
          element
        );

      return String(fieldValue || "")
        .toLowerCase()
        .includes(lowerCaseKeyword);
    });
  });
};

export const useSearch = (
  initialData,
  defaultSearchFields = ["name"],
  defaultSelectedField = null
) => {
  const [keyWord, setKeyWord] = useState("");
  const [selectedField, setSelectedField] = useState(defaultSelectedField);
  const [searchFields, setSearchFields] = useState(defaultSearchFields);

  const searchResult = search(
    keyWord,
    initialData,
    searchFields,
    selectedField
  );

  return {
    keyWord,
    setKeyWord,
    selectedField,
    setSelectedField,
    searchFields,
    setSearchFields,
    searchResult,
  };
};
