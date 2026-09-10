import React, { useEffect, useMemo } from "react";
import { CustomSelect } from "./CustomSelect";
import { useRoleStore } from "@/store/useRoleStore";

interface RoleSelectDropdownProps {
  selectedRoleIds: number[];
  onChange: (roleIds: number[]) => void;
  error?: string;
  label?: string;
}

export const RoleSelectDropdown: React.FC<RoleSelectDropdownProps> = ({
  selectedRoleIds,
  onChange,
  error,
  label = "",
}) => {
  const {
    roles,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchRoles,
    fetchMoreRoles,
  } = useRoleStore();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles.length, fetchRoles]);

  const options = useMemo(
    () =>
      roles.map((r) => ({
        id: r.id,
        label: r.name,
        code: r.code,
        subLabel: r.description,
      })),
    [roles]
  );

  return (
    <CustomSelect
      label={label}
      placeholder="Select roles..."
      isMultiple
      enableSearch
      value={selectedRoleIds}
      options={options}
      onChange={onChange}
      onScrollEnd={fetchMoreRoles}
      hasMore={hasMore}
      isLoading={isLoading}
      isFetchingMore={isFetchingMore}
      error={error}
    />
  );
};

export default RoleSelectDropdown;
