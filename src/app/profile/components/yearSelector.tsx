"use client";
// YearSelector.tsx
import React from "react";
import Select from "react-select";
import years from "./years";

type YearSelectorProps = {
  year: string;
  setYear: (value: string) => void;
};

const YearSelector: React.FC<YearSelectorProps> = ({ year, setYear }) => {
  const selected = years.find((y) => y.value === year) || null;

  return (
    <div className="flex-1 space-y-1">
      <Select
        options={years}
        value={selected}
        onChange={(option) => setYear(option?.value || "")}
        placeholder="เลือกปี"
        isSearchable
        className="w-full rounded-lg backdrop-blur-sm border border-white/30 text-white text-lg font-light z-10"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "white",
            padding: "0.6rem",
          }),
          singleValue: (base) => ({ ...base, color: "white" }),
          input: (base) => ({ ...base, color: "white" }),
          menu: (base) => ({
            ...base,
            backgroundColor: "#222",
            color: "white",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#444" : "#222",
            color: "white",
          }),
        }}
      />
    </div>
  );
};

export default YearSelector;
